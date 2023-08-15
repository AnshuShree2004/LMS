import AppError from "../utils/appError.js";

 export const isLoggedIn = function (req, res, next) {
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError("Unauthenticated, please login", 401));
  }

  // if token exist then verify it
  const tokenDetails = jwt.verify(token, process.env.JWT_SECRET);

  // if donot get token details then throw error
  if (!tokenDetails) {
    return next(new AppError("Unauthenticated, please login", 401));
  }

  req.user = tokenDetails;

  next();
};


export const authorizedRoles = (...roles) => (req, res, next) => {

  const currentRole = req.user.role
  if( !roles.includes(currentRole)) {
    return next (
      new AppError('You do not have permission to accesss this route.', 403)
      )
  }
next()
}

export const authorizedSubscriber = async(req, res, next) => {

const subscriptionStatus = req.user.subscription.status
const currentRole = req.user.role
if(currentRole !== 'Admin' && subscriptionStatus !== 'Active' )  {
  return next(
    new AppError('Please subscribe to access this route', 403)
  )
}

 next()
}

export default isLoggedIn