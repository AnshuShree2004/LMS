
import { Router } from 'express'
import { getAllCourse, getLectureByCourseId, createCourse, updateCourse, deleteCourse, addLectureToCourseById } from '../controllers/course.controller.js'
import upload from '../middlewares/multer.middleware.js'
import { isLoggedIn, authorizedRoles } from '../middlewares/auth.middleware.js';



const router = Router()

router
.route('/')
.get(getAllCourse)
.post(
    isLoggedIn,
    authorizedRoles('Admin'),
    upload.single('thumbnail'),
    createCourse
    )

router
 .route('/:courseId')
 .get(isLoggedIn, getLectureByCourseId)
 .put(
    isLoggedIn,
    authorizedRoles('Admin'),
    updateCourse
    )
 .delete(
    isLoggedIn,
    authorizedRoles('Admin'),
    deleteCourse
 )
 .post(
    isLoggedIn,
    authorizedRoles('Admin'),
    upload.single('thumbnail'),
    addLectureToCourseById
 )

 export default router
