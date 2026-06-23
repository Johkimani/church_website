import { api as tableApi } from "./api.js"
import authRoutes from "./Authorization.js"
import QuestionsRoutes from "./GenerateQuestions.js"
import uploadMedia from "./mediaRoutes.js"
import memberProgressRoute from "./getMemberProgress.js"
import JumuiComparisonRoutes from "./JumuiComparisonRoutes.js"
import notificationRoutes from "./notification.js"
import officialsRouter from "./officialsRouter.js";
import jumuiyaOfficialsRouter from "./jumuiyaOfficialsRouter.js";
import galleryRouter from "./galleryRouter.js";
import communityViewRouter from "./communityViewRouter.js";
import sliderRoutes from "./sliderRoutes.js";
import activitiesPublicRouter from "./activitiesPublicRouter.js";
import activitiesAdminRouter from "./activitiesAdminRouter.js";
import { Router } from "express"
import verifyToken from "../../middlewares/Tokens.js"
import formsDistributionRouter from "./FormsDistributionRouter.js"
import ordersRouter from "./orders.router.js";
import stkPushRouter from "./stkPush.route.js";
const router = Router()
import paymentRouter from "./payment.router.js";

router.use("/payments", paymentRouter);
router.use("/stkPush", stkPushRouter);


// Basic table routes
// Authentication & Users
router.use("/authentication", authRoutes);
router.use("/member", verifyToken, memberProgressRoute); // Kept: user-level route, NOT admin

// Features
router.use("/officials", officialsRouter);
router.use("/jumuiya-officials", jumuiyaOfficialsRouter);
router.use("/", galleryRouter); // handles /choir/gallery
router.use("/community-view", communityViewRouter);
router.use("/orders", ordersRouter);

// ======================================
// TEMP DEVELOPMENT COMMENT
// ADMIN AUTH DISABLED TEMPORARILY
// RE-ENABLE BEFORE PRODUCTION
// ======================================
// router.use("/questions", verifyToken, QuestionsRoutes);
router.use("/questions", QuestionsRoutes);

// router.use("/files", verifyToken, uploadMedia);
router.use("/files", uploadMedia);

router.use("/notifications", verifyToken, notificationRoutes);

// router.use("/csa", verifyToken, JumuiComparisonRoutes);
router.use("/csa", JumuiComparisonRoutes);

// router.use("/distribution", verifyToken, formsDistributionRouter);
router.use("/distribution", formsDistributionRouter);

// Slider and config endpoints for frontend banners
router.use("/", sliderRoutes);

// Activities (weekly/novena effective schedule = public read; management = admin-only)
router.use("/activities", activitiesPublicRouter);
router.use("/admin/activities", activitiesAdminRouter);


// Generic Table CRUD (should be last)
router.use("/", tableApi);

export default router;
