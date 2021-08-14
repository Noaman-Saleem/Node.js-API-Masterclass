const express = require("express");
const { getCourses, getCourse } = require("../controllers/courses");

const router = express.Router({ mergeParams: true }); //inorder to make router.use("/:bootcampId/courses", courseRouter); this work in botcamp routes file

router.route("/").get(getCourses);
router.route("/:id").get(getCourse);

module.exports = router;
