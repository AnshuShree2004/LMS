import AppError from '../utils/appError.js'
import User from '../models/user.models.js'

const cookieOptions = {
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 ,// 7 days
    httpOnly: true
}


const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  // check if user exists in database or not
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError("Email already exists", 400));
  }

  // if not exist then create a new user
  const user = await User.create({
    fullName, 
    email, 
    password,
    avatar: {
        public_id: email,
        secure_url: 'https://console.cloudinary.com/console/c-7da89045bcd7d651c4d984779c5478/media_library/folders/c4a651c983093f001216193c6dd4cfa740'
    }
  })


  if(!User) {
    return next(new AppError('User registration failed, please try again!', 400));
  }

  // TODO : uload user picture
  await user.save()

  // TODO: json web token

  user.password = undefined

  res.status(200).json({
    success: true,
    message: 'User registered successfully',
    user
  })
};






const login = async (req, res, next) => {

    const { email, password } = req.body

   if(!email || !password){
    return next(new AppError("All fields are required", 400));
  }


  // check user exist or not using email
 const user = await User.findOne({ email }).select('+password')

 // if user exist then check password
 if(!user || user.comparePassword(password)) {
     return next(new AppError("Email or password do not match", 400)); 
 }

 // if user exists then create token
 const token = await user.generateJWTToken()
 user.password = undefined
res.cookie('token', token, cookieOptions )

res.status(200).json({
    success: true,
    message: 'User registered successfully',
    user
})
};



const logout = (req, res, next) => {
    res.cookie('token', null, {
        secure: true,
        maxAge:0,
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    })
};

const getProfile = (req, res, next) => {

    const user = User.findById(req.user.id)

  res.status(200).json({
    success: true,
    message: 'User details',
    user
  })

};

export {
  register,
  login,
  logout,
  getProfile,
};
