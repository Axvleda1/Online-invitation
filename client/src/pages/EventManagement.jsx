import { useEffect, useState } from 'react';
import useEventStore from '../store/eventStore';
import toast from 'react-hot-toast';
import TimePicker from '../components/TimePicker';




const EventManagement = () => {
  const { events, fetchEvents, createEvent, updateEvent, deleteEvent, toggleEventStatus, isLoading } = useEventStore();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    endDate: '',
    dressCode: '',
    address: '',
    guestInfo: '',
    animationDuration: 3000,
    showOnHomepage: true,
    agenda: []
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        dressCode: event.dressCode,
        address: event.address,
        guestInfo: event.guestInfo,
        animationDuration: event.animationDuration || 3000,
        showOnHomepage: event.showOnHomepage,
        agenda: event.agenda || []
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        date: '',
        endDate: '',
        dressCode: '',
        address: '',
        guestInfo: '',
        animationDuration: 3000,
        showOnHomepage: true,
        agenda: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = editingEvent
      ? await updateEvent(editingEvent._id, formData)
      : await createEvent(formData);

    if (result.success) {
      toast.success(editingEvent ? 'Event updated!' : 'Event created!');
      handleCloseModal();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const result = await deleteEvent(id);
      if (result.success) {
        toast.success('Event deleted!');
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const result = await toggleEventStatus(id);
    if (result.success) {
      toast.success('Event status updated!');
    } else {
      toast.error(result.error);
    }
  };

  const handleAddAgendaItem = () => {
    setFormData({
      ...formData,
      agenda: [...formData.agenda, { time: '', title: '', subtitle: '' }]
    });
  };

  const handleAgendaChange = (index, field, value) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index][field] = value;
    setFormData({ ...formData, agenda: newAgenda });
  };

  const handleRemoveAgendaItem = (index) => {
    const newAgenda = formData.agenda.filter((_, i) => i !== index);
    setFormData({ ...formData, agenda: newAgenda });
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">
            ღონისძიებების მართვა
          </h2>
          <p className="text-gray-400 mt-1">ღონისძიებების მართვა</p>
        </div>

        <button onClick={() => handleOpenModal()} className="btn-primary w-full sm:w-auto">
          <span className="flex items-center justify-center space-x-2">
            <span>➕</span>
            <span>ღონისძიების დამატება</span>
          </span>
        </button>
      </div>

        
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loader"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-white mb-2">ღონისძიებები არ მოიძებნა</h3>
          <p className="text-gray-400 mb-6">Create your first event</p>
          <button onClick={() => handleOpenModal()} className="btn-primary inline-block">
            ღონისძიების დამატება
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {events.map((event) => (
            <div key={event._id} className="card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${event.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {event.isActive ? 'აქტიური' : 'გათიშული'}
                    </span>
                    {event.showOnHomepage && (
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                        მთავარ გვერდზე ნაჩვენები
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">თარიღი</p>
                      <p className="text-white">{event.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">დრეს კოდი</p>
                      <p className="text-white">{event.dressCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">მისამართი</p>
                      <p className="text-white">{event.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">ანიმაციის ხანგრძლივობა</p>
                      <p className="text-white">{event.animationDuration}ms</p>
                    </div>
                  </div>

                  {event.agenda && event.agenda.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-sm text-gray-400 mb-2">ღონისძიების წესრიგი: {event.agenda.length}</p>
                      <div className="space-y-2">
                        {event.agenda.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm text-gray-300">
                            <span className="text-tech-blue font-semibold">{item.time}</span> - {item.title}
                          </div>
                        ))}
                        {event.agenda.length > 3 && (
                          <p className="text-sm text-gray-500">+{event.agenda.length - 3} მეტი...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(event._id)}
                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    title={event.isActive ? 'გათიშული' : 'აქტიური'}
                  >
                    {event.isActive ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={() => handleOpenModal(event)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="რედაქტირება"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="წაშლა"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black bg-opacity-75">
          <div className="bg-tech-gray rounded-xl w-full max-w-full sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-tech-gray border-b border-gray-800 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingEvent ? 'ღონისძიების რედაქტირება' : 'ღონისძიების დამატება'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ღონისძიების დასახელება *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    თარიღი & დრო *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input-field"
                    lang="en-GB"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    დასრულების თარიღი & დრო
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="input-field"
                    lang="en-GB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    დრეს კოდი
                  </label>
                  <input
                    type="text"
                    name="dressCode"
                    value={formData.dressCode}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    მისამართი
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ანიმაციის ხანგრძლივობა (წამებში)
                  </label>
                  <input
                    type="number"
                    name="animationDuration"
                    value={formData.animationDuration}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showOnHomepage"
                    checked={formData.showOnHomepage}
                    onChange={handleChange}
                    className="w-5 h-5 mr-2"
                  />
                  <label className="text-sm font-medium text-gray-300">
                    მთავარ გვერდზე ნაჩვენები
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  სტუმრების ინფორმაცია
                </label>
                <textarea
                  name="guestInfo"
                  value={formData.guestInfo}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                />
              </div>

              
              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">ღონისძიების წესრიგი</h3>
                  <button
                    type="button"
                    onClick={handleAddAgendaItem}
                    className="btn-secondary text-sm"
                  >
                    + დამატება
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.agenda.map((item, index) => (
                    <div key={index} className="p-4 bg-tech-gray-light rounded-lg ">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label  className="block text-sm text-gray-400 mb-1">დრო</label>
                          <TimePicker
                            value={item.time}
                            onChange={(value) => handleAgendaChange(index, 'time', value)}
                            placeholder="20:00"
                            step={60}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-400 mb-1">დასახელება</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleAgendaChange(index, 'title', e.target.value)}
                            className="input-field"
                            placeholder="ღონისძიების დასახელება"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-sm text-gray-400 mb-1">დამატებითი ინფორმაცია</label>
                        <input
                          type="text"
                          value={item.subtitle}
                          onChange={(e) => handleAgendaChange(index, 'subtitle', e.target.value)}
                          className="input-field"
                          placeholder="დამატებითი ინფორმაცია"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAgendaItem(index)}
                        className="mt-2 text-red-400 hover:text-red-300 text-sm"
                      >
                        წაშლა
                      </button>
                    </div>
                  ))}
                </div>
              </div>

                    
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full sm:flex-1"
                >
                  {isLoading ? 'შენახვა...' : editingEvent ? 'განახლება' : 'დამატება'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary w-full sm:w-auto"
                >
                  გაუქმება
                </button>
              </div>
            </form>
          </div>

          
        </div>

        
      )}
      
    </div>
  );
};

export default EventManagement;
