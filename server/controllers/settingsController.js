import Settings from '../models/Settings.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.status(200).json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch settings'
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    const updateData = {};
    const allowedFields = [
      'logoText', 'subtitleText', 'goingButtonText', 'cantGoButtonText',
      'dressCodeLabel', 'addressLabel', 'eventAgendaLabel', 'guestInfoLabel',
      'goingButtonColor', 'goingButtonTextColor', 'goingButtonHoverColor',
      'cantGoButtonColor', 'cantGoButtonTextColor', 'cantGoButtonBorderColor',
      'cantGoButtonHoverColor', 'logoImage', 'showLinearGradient', 'showRadialGradient'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const updatedSettings = await Settings.findByIdAndUpdate(
      settings._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: updatedSettings }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update settings'
    });
  }
};


export const resetSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    

    const defaultSettings = {
      dressCodeLabel: 'Dress Code',
      addressLabel: 'Address',
      eventAgendaLabel: 'Event Agenda',
      guestInfoLabel: 'Guest Information',
      goingButtonColor: '#ffffff',
      goingButtonTextColor: '#000000',
      goingButtonHoverColor: '#f3f4f6',
      cantGoButtonColor: 'transparent',
      cantGoButtonTextColor: '#ffffff',
      cantGoButtonBorderColor: 'rgba(255, 255, 255, 0.3)',
      cantGoButtonHoverColor: 'rgba(255, 255, 255, 0.1)',
      logoImage: null,
      showLinearGradient: true,
      showRadialGradient: true
    };
    
    const updatedSettings = await Settings.findByIdAndUpdate(
      settings._id,
      defaultSettings,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Settings reset to defaults successfully',
      data: { settings: updatedSettings }
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset settings'
    });
  }
};
