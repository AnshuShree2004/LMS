
import { Router } from 'express'
import { buySubscription, cancelSubscription, getAllPayments, getRazorpayApiKey, verifySubscription } from '../controllers/payment.controllers.js'
import { isLoggedIn, authorizedRoles } from '../middlewares/auth.middleware.js';


const router = Router()


router
.route('/razorpay-key')
.get(
    isLoggedIn,
    getRazorpayApiKey
    )

router
.route('/subscribe')
.post(
    isLoggedIn,
    buySubscription
    )

router
.route('/verify')
.post( 
    isLoggedIn,
    verifySubscription
    )


router
.route('/unsubscribe')
.post(
     isLoggedIn,
    cancelSubscription
    )

// for admin

router
.route('/')
.get( 
    isLoggedIn,
    authorizedRoles('Admin'),
    getAllPayments
    )

export default router