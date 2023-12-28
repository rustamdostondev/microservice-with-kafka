import mongoose from 'mongoose';

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id;
}

export const TaskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
    },

    description: String,

    user_id: {
      type: String,
      required: [true, 'User can not be empty'],
    },

    start_time: {
      type: Number,
      required: [true, 'Start time can not be empty'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration can not be empty'],
    },
    is_solved: {
      type: Boolean,
      required: [true, 'Solved flag can not be empty'],
    },
    notification_id: {
      type: Number,
      required: false,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
  },
);
