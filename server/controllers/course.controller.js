import AppError from "../utils/appError.js"
import Course from "../models/course.models.js"


export const getAllCourse = async (req, res, next) => {
try {
 const courses = await Course.find({}).select('-lectures')   
 res.status(200).json({
    success: true,
    message: 'All Courses',
    courses
 })
} catch (error) {
    return next(
        new AppError(error.message, 500)
    )
}
}

export const getLectureByCourseId = async (req, res, next) => {
   try {
    const { coursesId } = req.params
   const course = await Course.findById(coursesId)

   if(!course) {
    return next(
        new AppError('Invalid course id', 500)
    )
   }


   res.status(200).json({
    success: true,
    message: 'Course lecture fetched successfully',
    lectures: course.lectures
   })
   } catch (error) {
    return next(
        new AppError(error.message, 500)
    )
   }

}

