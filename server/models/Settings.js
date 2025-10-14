import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  
  logoText: {
    type: String,
  },
  subtitleText: {
    type: String,
  },
  
  goingButtonText: {
    type: String,
  },
  cantGoButtonText: {
    type: String,
  },
  
  dressCodeLabel: {
    type: String,
  },
  addressLabel: {
    type: String,
  },
  eventAgendaLabel: {
    type: String,
  },
  guestInfoLabel: {
    type: String, 
  },
  
  goingButtonColor: {
    type: String,
    default: '#ffffff'
  },
  goingButtonTextColor: {
    type: String,
    default: '#000000'
  },
  goingButtonHoverColor: {
    type: String,
    default: '#f3f4f6'
  },
  cantGoButtonColor: {
    type: String,
    default: 'transparent'
  },
  cantGoButtonTextColor: {
    type: String,
    default: '#ffffff'
  },
  cantGoButtonBorderColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.3)'
  },
  cantGoButtonHoverColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.1)'
  },
  
  logoImage: {
    type: String,
    default: null
  },
  
  showLinearGradient: {
    type: Boolean,
    default: true
  },
  showRadialGradient: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('Settings', settingsSchema);
