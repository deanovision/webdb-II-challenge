const express = require("express");
const router = express.Router();
const knex = require("knex");
const knexConfigure = {
  client: "sqlite3",
  connection: {
    filename: "./data/lambda.sqlite3"
  },
  useNullAsDefault: true
};

const db = knex(knexConfigure);

router.get("/", (req, res) => {
  db("zoos")
    .then(zoos => {
      res.status(200).json(zoos);
    })
    .catch(err => {
      res.status(500).json({
        message: "internal error getting zoos"
      });
    });
});

router.post("/", (req, res) => {
  if (!req.body.name) {
    res.status(400).json({
      message: "bad request name is required"
    });
  } else {
    db("zoos")
      .insert(req.body, "id")
      .then(zoo => {
        db("zoos").then(zoos => {
          res.status(201).json(zoos);
        });
      })
      .catch(err => {
        res.status(500).json({ message: "internal error creating zoo" });
      });
  }
});

router.get("/:id", (req, res) => {
  db("zoos")
    .where({ id: req.params.id })
    .first()
    .then(zoo => {
      if (!zoo) {
        res.status(404).json({ message: "zoo does not exist" });
      } else {
        res.status(200).json(zoo);
      }
    })
    .catch(err => {
      res.status(500).json({ message: "internal error getting zoo" });
    });
});

router.delete("/:id", (req, res) => {
  db("zoos")
    .where({ id: req.params.id })
    .first()
    .del()
    .then(count => {
      if (count === 0) {
        res
          .status(404)
          .json({ message: "zoo does not exist or has already been deleted" });
      } else {
        res.status(200).json({ message: "zoo deleted" });
      }
    })
    .catch(err =>
      res.status(500).json({ message: "internal error deleting zoo" })
    );
});

router.put("/:id", (req, res) => {
  db("zoos")
    .where({ id: req.params.id })
    .first()
    .update(req.body)
    .then(count => {
      if (!count) {
        res.status(404).json({
          message: "zoo does not exist"
        });
      } else {
        res.status(201).json({ message: `${count} zoo(s) updated` });
      }
    })
    .catch(err => res.status(500).json({ message: "error updating zoo" }));
});

module.exports = router;
