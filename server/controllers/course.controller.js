import AppError from "../utils/appError.js"
import Course from "../models/course.models.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

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
    const { courseId } = req.params
   const course = await Course.findById(courseId)

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

export const createCourse = async (req, res, next) => {
try {
   
    const { title, description, category, createdBy } = req.body

    if( !title || !description || !category || !createdBy ) {
        return next( new AppError('All input fields are required', 400))
    }

    const course = await Course.create({
        title, 
        description, 
        category, 
        createdBy,
        thumbnail: {
            public_id: 'Dummy',
            secure_url:  'Dummy'
        },
    })

    // uploading files on cloudinary
    if(req.file) {
        const result = await cloudinary.v2.uploader(req.file.path, {
            folder:'lms'
        })

        if(result) {
            course.thumbnail.public_id = result.public_id
            course.thumbnail.secure_url = result.secure_url
        }

        fs.rm(`uploads/${req.file.filename}`)
    }


    await course.save()

    res.status(200).json({
        success: true,
        message: 'Course created successfully !',
        course
    })
} catch (error) {
    return next(
        new AppError(error.message, 500)
    )
}
}

export const updateCourse = async (req, res, next)  => {
    try {
    const { courseId } = req.params

    const course = await Course.findByIdAndUpdate(
        courseId, {
            $set : req.body
        },
        {
            runValidators : true
        }
    )

    if(!course) {
        return next(
            new AppError('Course does not exists', 400)
        )
    }

    res.status(200).json({
        success: true,
        message: 'Course updated successfully !',
        course
    })

    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }   
}

export const deleteCourse = async (req, res, next)  => {
    try {
        const { courseId } = req.params

        const course = await Course.findById(courseId)
        if( !courseId ) {
            return next(
                new AppError('Course does not exist with given id', 500)
            ) 
        }
    
        await Course.findByIdAndDelete(courseId)

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully !',
            
        })
    
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }  
}


export const addLectureToCourseById = async(req, res, next) => {
    try {
        const { title, description } = req.body
        const { courseId } = req.params

        if( !title || !description) {
            return next( new AppError('All input fields are required', 400))
        }

        const course = await Course.findById(courseId)

        if(!course)  {
            return next( new AppError('Course with given id does not exist', 400))
        }


        const lectureData = {
            title,
            description,
            lecture: {}
        }

        if(req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
            })

            if(result) {
                lectureData.lecture.public_id = result.public_id,
                lectureData.lecture.secure_url = result.secure_url
            }

            fs.rm(`uploads/${req.file.filename}`)
        }

        course.lectures.push(lectureData)
        course.numberOfLectures = course.lectures.length


        await course.save()

        res.status(200).json({
            success: true,
            message: 'Lecture added successfully !',
            course
            
        })
    

    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}


export const deleteLectureFromCourseById = async (req, res, next) => {
    // select course by courseId

    const { courseId } = req.params
    // look for courses whether it exists or not

    try {
        const lecture = await Course.findByIdAndDelete(courseId)

    if(!lecture) {
        return next( 
            new AppError('Lecture does not exist with this course id.', 400)
        )
    }

    await lecture.save()
    // response success

    res.status(400).json({
        success: true,
        message: 'Lecture deleted successfully!'
    })  
    } catch (error) {
        return next( 
            new AppError(error.message, 400)
        )
    }
  }