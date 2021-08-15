const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");
const asyncHandler = require("../middleware/async");
const path = require("path");

// @desc    Get all Bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  //********************************************************************
  //Simple query
  // {{URL}}/api/v1/bootcamps?location.state=MA&housing=true
  // {{URL}}/api/v1/bootcamps?averageCost[lte]=1000

  // console.log(req.query);
  //Create query string
  // let queryString = JSON.stringify(req.query);
  // let query;

  // // console.log(queryString);

  // //Create operators ($gt,$lt,etc)
  // queryString = queryString.replace(
  //   /\b(gt|lt|gte|lte|in)\b/g,
  //   (match) => `$${match}`
  // );
  // // console.log(queryString);

  // //Finding resourse
  // query = Bootcamp.find(JSON.parse(queryString));
  // // console.log(JSON.parse(queryString));

  // //Executing query
  // const bootcamps = await query;
  //***********************************************************************
  //SELECT CERTAIN FIELDS IN OUR RESPONSE
  let query;

  //Copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  //Create queryString
  let queryString = JSON.stringify(reqQuery);

  //Create operators like (gt,gte) etc
  queryString = queryString.replace(
    /\b(gt|lt|gte|lte|in)\b/g,
    (match) => `$${match}`
  );
  // console.log(queryString);

  //Finding resource
  query = Bootcamp.find(JSON.parse(queryString)).populate("courses");
  // .populate({
  //   path: "courses",
  //   select: "title tuition",
  // }); //we can pass the object here like Courses to select the certain fields
  // console.log(JSON.parse(queryString));

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    // console.log(fields);
    query = query.select(fields);
  }

  //SORT
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //PAGINATION
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();
  query = query.skip(startIndex).limit(limit);

  //Executing query
  const bootcamps = await query;

  //Pagination Results
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

// @desc    Get single Bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    //return is must otherwise there will be 2 different res.status()
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(
        `Bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create New Bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamps = asyncHandler(async (req, res, next) => {
  // console.log(req.body);
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update the Bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(
        `Bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete the Bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
  //findByIdAndDelete will not triger the CASCADE Course Delete middleware in the Bootcamp model file
  //So we use   bootcamp.remove() instead that trigers the middleware
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(
        `Bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }
  //.remove() instead that trigers the middleware
  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Upload photo
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  //pexels.com  free stock photos here
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  // console.log(req.files); //mimetype: 'image/jpeg',

  const file = req.files.file;
  //Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  //Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  //Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  // console.log(file.name);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      //500 is Server error
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    // http://localhost:5000/uploads/photo_5d725a1b7b292f5f8ceff788.jpg
    //see the file in your browser since Public is the Static folder
  });

  res.status(200).json({ success: true, data: file.name });
});

//******************OLD IS GOLD*****************************************************

// // @desc    Get all Bootcamps
// // @route   GET /api/v1/bootcamps
// // @access  Public
// exports.getBootcamps = async (req, res, next) => {
//   try {
//     const bootcamps = await Bootcamp.find();
//     res
//       .status(200)
//       .json({ success: true, count: bootcamps.length, data: bootcamps });
//   } catch (error) {
//     // console.log(error);
//     // res.status(400).json({ success: false });
//     next(error);
//   }
// };

// // @desc    Get single Bootcamps
// // @route   GET /api/v1/bootcamps/:id
// // @access  Public
// exports.getBootcamp = async (req, res, next) => {
//   try {
//     const bootcamp = await Bootcamp.findById(req.params.id);
//     if (!bootcamp) {
//       //return is must otherwise there will be 2 different res.status()
//       // return res.status(400).json({ success: false });
//       return next(
//         new ErrorResponse(
//           `Bootcamp not found with the id of ${req.params.id}`,
//           404
//         )
//       );
//     }

//     res.status(200).json({ success: true, data: bootcamp });
//   } catch (error) {
//     // console.log(error);
//     // res.status(400).json({ success: false });
//     // next(
//     //   new ErrorResponse(
//     //     `Bootcamp not found with the id of ${req.params.id}`,
//     //     404
//     //   )
//     // );
//     next(error);
//   }
// };

// // @desc    Create New Bootcamps
// // @route   POST /api/v1/bootcamps
// // @access  Private
// exports.createBootcamps = async (req, res, next) => {
//   console.log(req.body);
//   try {
//     const bootcamp = await Bootcamp.create(req.body);
//     res.status(201).json({ success: true, data: bootcamp });
//   } catch (error) {
//     console.log(`Oh No ERROR: ${error}`);
//     //400 means bad request missing required fields
//     // res.status(400).json({ success: false });
//     next(error);
//   }
// };

// // @desc    Update the Bootcamps
// // @route   PUT /api/v1/bootcamps/:id
// // @access  Private
// exports.updateBootcamps = async (req, res, next) => {
//   try {
//     const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!bootcamp) {
//       // return res.status(400).json({ success: false });
//       return next(
//         new ErrorResponse(
//           `Bootcamp not found with the id of ${req.params.id}`,
//           404
//         )
//       );
//     }
//     res.status(200).json({ success: true, data: bootcamp });
//   } catch (error) {
//     console.log(error);
//     // res.status(400).json({ success: false });
//     next(error);
//   }
// };

// // @desc    Delete the Bootcamps
// // @route   DELETE /api/v1/bootcamps/:id
// // @access  Private
// exports.deleteBootcamps = async (req, res, next) => {
//   try {
//     const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
//     if (!bootcamp) {
//       // return res.status(400).json({ success: false });
//       return next(
//         new ErrorResponse(
//           `Bootcamp not found with the id of ${req.params.id}`,
//           404
//         )
//       );
//     }
//     res.status(200).json({ success: true, data: {} });
//   } catch (error) {
//     console.log(error);
//     // res.status(400).json({ success: false });
//     next(error);
//   }
// };
