const userService = require("../services/userService");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

jest.mock("../models/userModel");
jest.mock("bcrypt");

describe("UserService - Register User", () => {
  it("should throw an erro if the email is already registerd", async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 1,
      email: "test@test.com",
    });

    await expect(
      userService.registerUser("testuser", "test@test.com", "password123"),
    ).rejects.toThrow("Email is already registerd");
  });

  it("should successfully register a new user and hash the password", async () => {
    userModel.findUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed_fake_password");
    userModel.createUser.mockResolvedValue({
      id: 2,
      username: "newuser",
      email: "new@test.com",
    });
    const result = await userService.registerUser(
      "newuser",
      "new@test.com",
      "password123",
    );
    expect(result).toHaveProperty("id", 2);
    expect(result.username).toBe("newuser");

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(userModel.createUser).toHaveBeenCalledWith(
      "newuser",
      "new@test.com",
      "hashed_fake_password",
    );
  });
});
