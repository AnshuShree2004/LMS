
import { Router } from 'express'
import { getAllCourse, getLectureByCourseId } from '../controllers/course.controller.js'
import isLoggedIn from '../middlewares/auth.middleware.js'

const router = Router()

router
.route('/')
.get(getAllCourse)

router
 .route('/:courseId')
 .get(isLoggedIn, getLectureByCourseId)

 export default router
