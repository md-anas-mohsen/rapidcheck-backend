const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { boolean } = require("joi");
const { ORDER_BY_DIRECTIONS } = require("../constants/common");
const { USER_ROLE, userSettingsSchema } = require("../constants/user");

const studentSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide first name"],
      maxLength: [25, "Name cannot exceed 25 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide last name"],
      maxLength: [25, "Name cannot exceed 25 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: [validator.isEmail, "Please enter valid email address"],
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Please provide username"],
      maxLength: [10, "Name cannot exceed 10 characters"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be longer than 6 characters"],
      select: false,
    },
    settings: userSettingsSchema,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    toJSON: { virtuals: true },
  }
);

studentSchema.pre("count", function () {
  this.where({ deletedAt: null });
});

studentSchema.pre("find", function () {
  this.where({ deletedAt: null });
});

studentSchema.pre("findOne", function () {
  this.where({ deletedAt: null });
});

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

studentSchema.methods.delete = async function () {
  if (!this.deletedAt) {
    this.deletedAt = Date.now();
    await this.save();
  }
};

studentSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

studentSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: USER_ROLE.STUDENT },
    process.env.JWT_AUTH_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_AUTH_TOKEN_EXPIRES_TIME,
    }
  );
};

studentSchema.methods.getJwtRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_TIME,
  });
};

studentSchema.statics.searchQuery = function (keyword, queryParams) {
  const stringSearchFields = ["firstName", "lastName", "email", "username"];
  const alphaNumericSearchFields = ["_id"];

  let query = {};
  if (keyword) {
    query = {
      $or: [
        ...stringSearchFields.map((field) => ({
          [field]: {
            $regex: keyword,
            $options: "i",
          },
        })),
        ...alphaNumericSearchFields.map((field) => ({
          $where: `/.*${keyword}.*/.test(this.${field})`,
        })),
      ],
    };
  }

  if (!!queryParams && queryParams.exceptUserWithId) {
    query._id = {
      $ne: queryParams.exceptUserWithId,
    };
  }

  if (
    !!queryParams &&
    queryParams.studentId &&
    Array.isArray(queryParams.studentId)
  ) {
    query._id = {
      $all: querParams.studentId,
    };
  }

  // let sortableFields = ["_id", "role", "createdAt", "email", "name"];

  let sortOrder = {};

  if (!!queryParams && !!queryParams.orderBy) {
    let orderBy = queryParams.orderBy;
    direction = queryParams.direction || ORDER_BY_DIRECTIONS.ASC;
    sortOrder =
      sortableFields.includes(orderBy) &&
      direction === ORDER_BY_DIRECTIONS.DESC &&
      orderBy
        ? { [orderBy]: "desc" }
        : sortableFields.includes(orderBy) &&
          direction === ORDER_BY_DIRECTIONS.ASC &&
          orderBy
        ? { [orderBy]: "asc" }
        : {};
  }

  return this.find(query).sort(sortOrder);
};

studentSchema.virtual("role").get(function () {
  return USER_ROLE.STUDENT;
});

module.exports = mongoose.model("Student", studentSchema);
