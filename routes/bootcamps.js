const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamps,
  updateBootcamps,
  deleteBootcamps,
} = require("../controllers/bootcamps");

const router = express.Router();

router.route("/").get(getBootcamps).post(createBootcamps);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamps)
  .delete(deleteBootcamps);

//Routes
// router.get("/", (req, res) => {
//   res.status(200).json({ success: true, msg: "Show all Bootcamps" });
// });

// router.get("/:id", (req, res) => {
//   console.log(req);
//   res
//     .status(200)
//     .json({ success: true, msg: `Showing Bootcamp with ID ${req.params.id}` });
// });

// router.post("/", (req, res) => {
//   res.status(200).json({ success: true, msg: `Created a new Bootcamp` });
// });

// router.put("/:id", (req, res) => {
//   console.log(req);
//   res
//     .status(200)
//     .json({ success: true, msg: `Updated Bootcamp with Id ${req.params.id}` });
// });

// router.delete("/:id", (req, res) => {
//   res
//     .status(200)
//     .json({ success: true, msg: `Deleted Bootcamp with Id ${req.params.id}` });
// });

module.exports = router;
