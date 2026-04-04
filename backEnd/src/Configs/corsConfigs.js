 


//  // global middlewares

const corsOptions = {
  origin: (process.env.CORS_ORIGIN === "*" || !process.env.CORS_ORIGIN)
      ? "*" 
      : process.env.CORS_ORIGIN.split(","), 
    credentials: true,
};

export default corsOptions;