import { userModel } from "../../models/user/user.model.js";
import { findOne, update } from "../../db/db.repo.js";
export const updateProfile = async ({
  _id,
  userEmail,
  firstName,
  lastName,
  email,
  phoneNumber,
}) => {
  const updateData = {};
  if (email) {
    if (email == userEmail)
      throw new Error("New email must be different from current email");
    const emailExist = await findOne({
      model: userModel,
      filter: { email, _id: { $ne: _id } },
    });

    if (emailExist) throw new Error("Email already used");
    updateData.email = email;
  }
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;

  if (Object.keys(updateData).length === 0)
    throw new Error("No Fields to update");

  const updateUser = await update({
    model: userModel,
    filter: _id,
    data: updateData,
    select: "firstName lastName email phoneNumber",
    options: { returnDocument: "after" },
  });

  if (!updateUser) throw new Error("User not found");

  return updateUser;
};
