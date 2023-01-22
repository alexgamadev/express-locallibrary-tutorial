const express = require("express");
const router = express.Router();

const book_controller = require("../controllers/bookController");
const book_copies_controller = require("../controllers/bookCopiesController");
const genre_controller = require("../controllers/genreController");
const author_controller = require("../controllers/authorController");

// BOOK ROUTES //
router.get("/", book_controller.index);

router.get("/book/create", book_controller.book_create_get);

router.post("/book/create", book_controller.book_create_post);

router.get("/book/:id/delete", book_controller.book_delete_get);

router.post("/book/:id/delete", book_controller.book_delete_post);

router.get("/book/:id/update", book_controller.book_update_get);

router.post("/book/:id/update", book_controller.book_update_post);

router.get("/book/:id", book_controller.book_details);

router.get("/books", book_controller.book_list);

/// AUTHOR ROUTES ///
router.get("/author/create", author_controller.author_create_get);

router.post("/author/create", author_controller.author_create_post);

router.get("/author/:id/delete", author_controller.author_delete_get);

router.post("/author/:id/delete", author_controller.author_delete_post);

router.get("/author/:id/update", author_controller.author_update_get);

router.post("/author/:id/update", author_controller.author_update_post);

router.get("/author/:id", author_controller.author_details);

router.get("/authors", author_controller.author_list);

/// GENRE ROUTES ///
router.get("/genre/create", genre_controller.genre_create_get);

router.post("/genre/create", genre_controller.genre_create_post);

router.get("/genre/:id/delete", genre_controller.genre_delete_get);

router.post("/genre/:id/delete", genre_controller.genre_delete_post);

router.get("/genre/:id/update", genre_controller.genre_update_get);

router.post("/genre/:id/update", genre_controller.genre_update_post);

router.get("/genre/:id", genre_controller.genre_details);

router.get("/genres", genre_controller.genre_list);

/// BOOKINSTANCE ROUTES ///
router.get(
  "/bookcopies/create",
  book_copies_controller.bookcopy_create_get
);

router.post(
  "/bookcopies/create",
  book_copies_controller.bookcopy_create_post
);

router.get(
  "/bookcopies/:id/delete",
  book_copies_controller.bookcopy_delete_get
);

router.post(
  "/bookcopies/:id/delete",
  book_copies_controller.bookcopy_delete_post
);

router.get(
  "/bookcopies/:id/update",
  book_copies_controller.bookcopy_update_get
);

router.post(
  "/bookcopies/:id/update",
  book_copies_controller.bookcopy_update_post
);

router.get("/bookcopies/:id", book_copies_controller.bookcopy_details);

router.get("/bookcopies", book_copies_controller.bookcopies_list);

module.exports = router;