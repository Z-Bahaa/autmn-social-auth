import * as mongoose from 'mongoose'

interface ProfileSchema extends Document {
  userId: string;
  profilePicture: string;
  username: string;
  address: string;
  isVerified: boolean;
  lastActiveDate: Date;
  bio: string;
  soldItems: string[];
  followers: string[];
  following: string[];
}


const Schema = mongoose.Schema

const UserProfileSchema = new Schema<ProfileSchema>({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  profilePicture: {
    type: String
  },
  username: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActiveDate: {
    type: Date,
  },
  bio: {
    type: String,
    required: false
  },
  // soldItems:{
  //   type: Array,
  //   required: false
  // },
  // followers: {
  //   type: Array,
  //   required: false
  // },
  // following: {
  //   type: Array,
  //   required: false
  // },
  // tokens: [
  //   {
  //     access: {
  //       type: String,
  //       required: true,
  //     },
  //     token: {
  //       type: String,
  //       required: true,
  //     }
  //   }
  // ]
})


const UserProfile = mongoose.model("UserProfile", UserProfileSchema)


export default UserProfile
export type { ProfileSchema }