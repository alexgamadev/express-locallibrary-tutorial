const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Author = require("../models/author");
const Book = require("../models/book");

exports.author_list = async (req, res) => {
  const authorList = await Author.find({})
    .sort({family_name: 1})
    .exec();

    res.render("author/author_list", { title: "Author List", authorList });
}

exports.author_details = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const author = await Author.findById(id).exec();
  const books = await Book.find( { author: id }).exec();

  if (author == null) {
    // No results.
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author/author_details", { title: "Author Details", author, books });
}

exports.author_create_get = (req, res) => {
  res.render("author/author_form", { title: "Create Author" } );
}

exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters"),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters"),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("author/author_form", { 
        title: "Create Author", 
        author: req.body, 
        errors: errors.array() 
      } );
      return;
    }

    const { first_name, family_name, date_of_birth, date_of_death } = req.body;
    const author = new Author({
      first_name, 
      family_name, 
      date_of_birth, 
      date_of_death
    });

    await author.save();
    res.redirect(author.url);
  }
];

exports.author_delete_get = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const [author, books] = await Promise.all([
    Author.findById(id),
    Book.find({author: id})
  ]);

  if(author === null) {
    res.redirect("/catalog/authors");
  }

  res.render("author/author_delete", {
    title: "Delete author",
    author,
    books
  });
}

exports.author_delete_post = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const [author, books] = await Promise.all([
    Author.findById(id),
    Book.find({author: id})
  ]);

  if(books.length > 0) {
    res.render("author/author_delete", {
      title: "Delete author",
      author,
      books
    });
    return;
  }

  await Author.findByIdAndDelete(id);
  res.redirect("/catalog/authors");
}

exports.author_update_get = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const author = await Author.findById(id); 
  res.render("author/author_form", { title: "Update Author", author } );
}

exports.author_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters"),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters"),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  async (req, res) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("author/author_form", { 
        title: "Update Author", 
        author: req.body, 
        errors: errors.array() 
      } );
      return;
    }

    const { first_name, family_name, date_of_birth, date_of_death } = req.body;
    const author = new Author({
      first_name, 
      family_name, 
      date_of_birth, 
      date_of_death,
      _id: id
    });

    await Author.findAndUpdate(id, author, {});
    res.redirect(author.url);
  }
]