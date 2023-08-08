import AppError from "../utils/appError.js";
import User from "../models/user.models.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import crypto from 'crypto'

const cookieOptions = {
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
};

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
      secure_url:
        "https://console.cloudinary.com/console/c-7da89045bcd7d651c4d984779c5478/media_library/folders/c4a651c983093f001216193c6dd4cfa740",
    },
  });

  if (!User) {
    return next(
      new AppError("User registration failed, please try again!", 400)
    );
  }

  // TODO : upload user picture
  console.log("File Details > ", JSON.stringify(req.file));
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });

      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // remove file from local server
        fs.rm(`uploads/${req.file.filename}`)
      }
    } catch (error) {
      return next(
        new AppError(e.message || "File not uploaded, please try again!", 500)
      );
    }
  }
  await user.save();

  // TODO: json web token
  const token = await user.generateJWTToken();
  res.cookie("token", token, cookieOptions);
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "User registered successfully",
    user,
  });
}
;

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  // check user exist or not using email
  const user = await User.findOne({ email }).select("+password");

  // if user exist then check password
  if (!user || user.comparePassword(password)) {
    return next(new AppError("Email or password do not match", 400));
  }

  // if user exists then create token
  const token = await user.generateJWTToken();
  user.password = undefined;
  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "User registered successfully",
    user,
  });
};

const logout = (req, res, next) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

const getProfile = (req, res, next) => {
  const user = User.findById(req.user.id);

  res.status(200).json({
    success: true,
    message: "User details",
    user,
  });
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  // check email exist or not
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Email is not registered", 400));
  }

  // consider email was there and email exists in the database
  const resetToken = await user.generatePasswordToken();
  await user.save();

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const subject = "Reset Password";
  const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

  console.log(resetPasswordUrl)
  try {
    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully!`,
    });
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();
    return next(new AppError(error.message, 500));
  }
};

const resetPassword = async (req, res, next) => {
  const { resetToken } = req.param
  const { password } = req.body

   const forgotPasswordToken = crypto
   .createHash("sha256")
   .update(resetToken)
   .digest("hex");

   const user = await User.findOne( { 
    forgotPasswordToken,
    forgotPasswordExpiry :  { $gt: Date.now() }
  })

  if(!user) {
    return next(
      new AppError('Token is invalid or expired, please try again', 400)
    )
  }

  user.password = password
  user.forgotPasswordExpiry = undefined
  user.forgotPasswordToken = undefined

  await user.save()

  res.status(200).json({
    success: true,
    message: 'Password changed successfully!'
  })

}
;

const changePassword = async function(req, res, next) {

  const { oldPassword, newPassword } = req.body

  if(!oldPassword || !newPassword) {
    return next(
      new AppError('All fields are mandatory', 400)
    )
  }

  const user = await User.findById(id).select('+password')


  if(!user){
    return next(
      new AppError('User does not exist', 400)
    )
  }

  const isPasswordValid = await user.comparePassword(password)

  if(!isPasswordValid){
    return next(
      new AppError('Invalid old password', 400)
    ) 
  }

  user.password = newPassword

  await user.save()

  user.password = undefined

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  })
}


const updateUser = async (req, res, next)=> {
  const { fullName } = req.body
  const {  id } =req.user

  const user = await User.findById(id)

  if(!user){
    return next( new AppError('User does not exist', 400))
  }

  if(fullName) {
    user.fullName = fullName
  }

  if(req.file){
await cloudinary.v2.uploader.destroy(user.avatar.public_id)

const result = await cloudinary.v2.uploader(req.file.path, {
  folder: "lms",
  width: 250,
  height: 250,
  gravity: "faces",
  crop: "fill",
});

if (result) {
  user.avatar.public_id = result.public_id;
  user.avatar.secure_url = result.secure_url;

  // remove file from local server
  fs.rm(`uploads/${req.file.filename}`)
}
  }

  await user.save()

  res.status(200).json({
    success: true,
    message: 'User details updated successfully!'
  })
}

export { register, login, logout, getProfile, forgotPassword, resetPassword, changePassword, updateUser };
