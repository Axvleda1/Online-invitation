import mongoose from 'mongoose';

const agendaItemSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  dressCode: {
    type: String,
  },
  address: {
    type: String,
  },
  guestInfo: {
    type: String,
  },
  agenda: [agendaItemSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  showOnHomepage: {
    type: Boolean,
    default: true
  },
  videoUrl: {
    type: String,
    default: ''
  },
  animationDuration: {
    type: Number,
    default: 3000 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Event = mongoose.model('Event', eventSchema);

export default Event;