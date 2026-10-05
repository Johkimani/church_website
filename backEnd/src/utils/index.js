import fs from "fs";
import cloudinary from "../Configs/cloudinaryConfigs.js";
import { testDb } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { ApiError } from "./ApiError.js";

export const parseQuestionBlock = (block) => {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

  // First line must look like "1. **Question...**"
  let questionText = lines[0]?.replace(/^\d+\.\s*/, "");
  questionText = questionText?.replace(/^\*+|\*+$/g, ""); // strip **

  if (!questionText || !/^\d+\./.test(lines[0])) return null;

  // Next 4 lines = options (A) or A.)
  const answers = lines
    .slice(1, 5)
    .map((line) => {
      const match = line.match(/^([A-Da-d])[\.\)]\s*(.*)$/);
      if (!match) return null;
      return { option: `${match[1].toLowerCase()})`, text: match[2] };
    })
    .filter(Boolean);

  if (answers.length !== 4) return null;

  // Find correct answer line
  const answerLine = lines.find((l) => /correct answer:/i.test(l));
  if (!answerLine) return null;

  const match = answerLine.match(
    /correct answer:\s*([A-Da-d])[\.\)]?\s*(.*)?/i,
  );
  if (!match) return null;

  const correctOption = `${match[1].toLowerCase()})`;

  // Explanation line may be separate
  const explanationLine = lines.find((l) => /explanation:/i.test(l));
  const explanation = explanationLine
    ? explanationLine.replace(/^\*?Explanation:\*?\s*/i, "")
    : "No explanation provided";

  const correctAnswerText =
    answers.find((a) => a.option === correctOption)?.text || match[2] || "";

  return {
    questionText,
    answers,
    correctAnswer: {
      option: correctOption,
      text: correctAnswerText,
      explanation,
    },
  };
};

export const sansitiseAndParseQuestionBlock = (content) => {
  const array = content
    .split(/(?:\n\s*\n|---)/) // split on blank lines OR ---
    .map((block, i) => {
      const parsed = parseQuestionBlock(block);
      if (!parsed) {
        logger.warn(`Skipping malformed block #${i}:`, block);
        return null;
      }
      return { ...parsed, createdAt: new Date() };
    })
    .filter(Boolean);

  return array;
};


export async function uploadOneFile(file) {
  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: "auto",
  });

  if (!result || !result.secure_url) {
    throw new ApiError( 502 ,"Cloudinary upload failed")
  }

  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  const insertQuery =
    "INSERT INTO uploads (public_id, url, format, resource_type, created_at) VALUES ($1,$2,$3,$4,$5) RETURNING *";
  const values = [
    result.public_id,
    result.secure_url,
    result.format,
    result.resource_type,
    result.created_at,
  ];

  const dbResult = await testDb.query(insertQuery, values);

  return dbResult.rows[0];
}


export async function uploadManyFiles(files, retry = false) {

  const successesUploadedFiles = [];
  const faildeToUploadFiles = [];

  const settledResults = await Promise.allSettled(
    files.map((file) => uploadOneFile(file)),
  );


  console.log(settledResults , "settledResults fromuploadmanyfiles utility folder");
  
  for (const [index, result] of settledResults?.entries()) {
    if (result.status === "fulfilled") {
      successesUploadedFiles.push(result.value);
    } else {
      faildeToUploadFiles.push(files[index]);
      logger.warn(
        `Upload failed for ${files[index].originalname}: ${result.reason.error}`,
      );
    }
  }

  if (faildeToUploadFiles.length > 0 && !retry) {
    logger.info(`Retrying ${faildeToUploadFiles.length} failed upload(s)...`);
    const retryResults = await uploadManyFiles(faildeToUploadFiles, true);
    successesUploadedFiles.push(...retryResults?.successesUploadedFiles);


    for (const failedFile of retryResults?.faildeToUploadFiles) {
      if (fs.existsSync(failedFile.path)) {
        fs.unlinkSync(failedFile.path);
        logger.info(
          `Deleted failed file from disk: ${failedFile.originalname}`,
        );
      }
      retryResults.faildeToUploadFiles=[];
    }

    return {
      success: true,
      message: "Files uploaded with some retries",
      count: successesUploadedFiles.length,
      data: successesUploadedFiles,
      faildeToUploadFiles: retryResults.faildeToUploadFiles.map((f) => f.originalname),
    };
  }

  return {
    success: true,
    message: faildeToUploadFiles.length === 0 ? "All files uploaded successfully" : "Some files failed to upload",
    count: successesUploadedFiles.length,
    data: successesUploadedFiles,
    faildeToUploadFiles: faildeToUploadFiles.map((f) => f.originalname),
  };
}

export const removeUnusedMulterImageFilesOnError = (req) => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) {
      if (fs.existsSync(multerFile.path)) {
        fs.unlinkSync(multerFile.path);
      }
    }

    if (multerFiles) {
      if (Array.isArray(multerFiles)) {
        multerFiles.forEach((fileObject) => {
          if (fs.existsSync(fileObject.path)) {
            fs.unlinkSync(fileObject.path);
          }
        });
      } else {
        /** @type {Express.Multer.File[][]}  */
        const filesValueArray = Object.values(multerFiles);
        filesValueArray.forEach((fileFields) => {
          fileFields.forEach((fileObject) => {
            if (fs.existsSync(fileObject.path)) {
              fs.unlinkSync(fileObject.path);
            }
          });
        });
      }
    }
  } catch (error) {
    // fail silently
    logger.error(`Error while removing image files: ${error.message || error}`);
  }
};
