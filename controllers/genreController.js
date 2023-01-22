const mongoose = require("mongoose");
const Genre = require("../models/genre");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

exports.genre_list = async (req, res) => {
  const genreList = await Genre.find({})
    .sort({name: 1})
    .exec();

  res.render("genre/genre_list", {title: "Genre List", genreList});
}

exports.genre_details = async (req, res) => {
  const genreId = mongoose.Types.ObjectId(req.params.id);
  const genrePromise = Genre.findById(genreId).exec();
  const bookPromises = Book.find({ genre: genreId }).exec();

  const [genre, books] = await Promise.all([genrePromise, bookPromises]);
  if( genre == null ) {
    const error = new Error("Genre not found");
    error.status = 404;
    return next(error);
  }
  res.render("genre/genre_detail", {title: "Genre Details", genre, books});
}

exports.genre_create_get = (req, res) => {
  res.render("genre/genre_form", { title: "Create Genre" } );
}

exports.genre_create_post = [
  body("name", "Genre name required").trim().isLength({ min: 1}).escape(),
  async (req, res) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });

    if(!errors.isEmpty()) {
      res.render("genre/genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
      return;
    }

    const existingGenre = await Genre.findOne({ name: req.body.name }).exec();
    if(existingGenre) {
      res.redirect(existingGenre.url);
    } else {
      await genre.save();
      res.redirect(genre.url);
    }
  }
]

exports.genre_delete_get = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const genre = await Genre.findById(id);

  if(genre === null) {
    res.redirect("/catalog/genres");
  }

  res.render("genre/genre_delete", {
    title: "Delete genre",
    genre
  });
}

exports.genre_delete_post = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const genre = await Genre.findByIdAndRemove(id);

  res.redirect("/catalog/genres");
}

exports.genre_update_get = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const genre = await Genre.findById(id);
  res.render("genre/genre_form", { title: "Update Genre", genre } );
}

exports.genre_update_post = [
  body("name", "Genre name required").trim().isLength({ min: 1}).escape(),
  async (req, res) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name, _id: id });

    if(!errors.isEmpty()) {
      res.render("genre/genre_form", {
        title: "Update Genre",
        genre,
        errors: errors.array(),
      });
      return;
    }

    const existingGenre = await Genre.findOne({ name: req.body.name }).exec();
    if(existingGenre) {
      res.redirect(existingGenre.url);
    } else {
      await Genre.findByIdAndUpdate(id, genre, {});
      res.redirect(genre.url);
    }
  }
]