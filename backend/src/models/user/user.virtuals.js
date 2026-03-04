import { userSchema } from "./user.model.js";

userSchema
  .virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
  })
  .get(function (value) {
    return this.firstName + " " + this.lastName;
  });
