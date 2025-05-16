class ForbiddenError extends Error {
  //FRONTEND_URL=https://aidf-horizone-frontend-amila.netlify.app

    constructor(message: string) {
      super(message);
      this.name = "ForbiddenError";
    }
  }
  
  export default ForbiddenError;