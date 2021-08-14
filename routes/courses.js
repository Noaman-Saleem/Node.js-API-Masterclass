const express = require("express");
const { getCourses } = require("../controllers/courses");

const router = express.Router({ mergeParams: true }); //inorder to make router.use("/:bootcampId/courses", courseRouter); this work in botcamp routes file

router.route("/").get(getCourses);

module.exports = router;
