const { default: mongoose } = require("mongoose");
const BookCopy = require("../models/bookcopy");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

exports.bookcopies_list = async (req, res) => {
  const bookCopies = await BookCopy.find({})
    .populate("book")
    .exec();

  res.render("bookcopies/bookcopies_list", { title: "Book Copies", bookCopyList: bookCopies });
}

exports.bookcopy_details = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const copy = await BookCopy.findById(id)
    .populate("book")
    .exec();

  if (copy == null) {
    // No results.
    const err = new Error("Copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookcopies/bookcopy_details", { title: "Book Copy Details", copy });
}

exports.bookcopy_create_get = async (req, res) => {
  const books = await Book.find({}, "title");
  res.render("bookcopies/bookcopy_form", { title: "Create Book Copy", books });
}

exports.bookcopy_create_post = [
  body("book", "book must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("imprint", "Imprint must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),  
  body("status").escape(),
  body("due_back", "Invalid due date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  async (req, res, next) => {
    const errors = validationResult(req);
    const { book, imprint, status, due_back } = req.body;

    const copy = new BookCopy({
      book, 
      imprint, 
      status, 
      due_back
    });

    if( !errors.isEmpty()) {
      const books = await Book.find({}, "title");
      res.render("bookcopies/bookcopy_form", { 
        title: "Create Book Copy", 
        books, 
        selected_copy: copy.book._id,
        errors: errors.array(),
        copy });
      return;
    }
    await copy.save();
    res.redirect(copy.url);
  }
]

exports.bookcopy_delete_get = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const copy = await BookCopy.findById(id).populate("book").exec();

  if(copy === null) {
    res.redirect("/catalog/bookcopies");
  }

  res.render("bookcopies/bookcopy_delete", {
    title: "Delete copy",
    copy
  });
}

exports.bookcopy_delete_post = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  await BookCopy.findByIdAndRemove(id);

  res.redirect("/catalog/bookcopies");
}

exports.bookcopy_update_get = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const [copy, books] = await Promise.all([
    BookCopy.findById(id),
    Book.find({}, "title")
  ]);
  res.render("bookcopies/bookcopy_form", { title: "Create Book Copy", books, copy });
}

exports.bookcopy_update_post = [
  body("book", "book must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("imprint", "Imprint must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),  
  body("status").escape(),
  body("due_back", "Invalid due date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  async (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    const errors = validationResult(req);
    const { book, imprint, status, due_back } = req.body;

    const copy = new BookCopy({
      book, 
      imprint, 
      status, 
      due_back,
      _id: id
    });

    if( !errors.isEmpty()) {
      const books = await Book.find({}, "title");
      res.render("bookcopies/bookcopy_form", { 
        title: "Update Book Copy", 
        books, 
        selected_copy: copy.book._id,
        errors: errors.array(),
        copy });
      return;
    }
    await BookCopy.findByIdAndUpdate(id, copy, {});
    res.redirect(copy.url);
  }
]