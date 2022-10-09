import { Model, Schema, model, Document } from 'mongoose'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import * as i18n from 'i18n';

import config from "../config";

interface UserSchema extends Document {
  mobileNumber: string;
  password: string;
  verified: boolean;
  tokens: Array<{
    access: string;
    token: string;
  }>;
  removeToken: (token: string) => void;
  generateAuthToken: () => Promise<string>;
}

interface UserModel extends Model<UserSchema> {
  findByCredentials: (login: string, password: string) => Promise<UserSchema>;
  findByToken: (token: string) => Promise<UserSchema>
}

const UserSchema = new Schema<UserSchema, UserModel>({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      }
    }
  ],

})

UserSchema.methods.generateAuthToken = function () {
  const data = {
    _id: this._id.toHexString()
  }
  const access = "auth"
  const token = jwt.sign(data, config.jwtSecret)
  this.tokens.push({
    access,
    token: token
  })
  return this.save()
    .then(() => {
      return token
    }).catch((e: unknown) => e)
}

UserSchema.methods.removeToken = function (token: string) {
  const user = this
  return user.update({
    $pull: {
      tokens: { token }
    }
  })
}

UserSchema.methods.toJSON = function () {
  const user = this.toObject()
  return {
    _id: user._id,
    mobileNumber: user.mobileNumber,
    messages: user.messages,
  }
}

UserSchema.statics.findByToken = function (token) {
  const User = this
  let decoded
  try {
    decoded = jwt.verify(token, config.jwtSecret)
    if (typeof decoded !== 'string') {
      return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': "auth"
      })
    }
  } catch (e) {
    return Promise.reject(i18n.__('FIND_BY_TOKEN_INVALID_TOKEN'))
  }
}

UserSchema.statics.findByCredentials = async (mobileNumber, password) => {
  const user = await User.findOne({ mobileNumber })
  if (!user) {
    return Promise.reject(i18n.__('LOGIN_PHONE_NUMBER_NOT_FOUND'))
  }

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, res) => {
      if (res) resolve(user)
      else reject(i18n.__('LOGIN_WRONG_PASSWORD'))
    })
  })
}

UserSchema.pre("save", function (next) {
  const user = this
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err: Error, salt) => {
      if (err) throw new Error(err.message)
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) throw new Error(err.message)
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

const User = model<UserSchema, UserModel>("User", UserSchema)


export default User
export type { UserSchema }