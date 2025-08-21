"use client"
import React, { useEffect, useState } from 'react';

// Convert 24-hour format to 12-hour format with AM/PM
const formatTo12Hour = (timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

const DeliverySlotSelector = ({ slots = [], selectedDate, selectedSlotId, setSelectedSlotId }) => {


  const [availableSlots, setAvailableSlots]=useState([]);
  if (!selectedDate) {
    return (
      <div className="mb-6 px-6">
        <p className="text-gray-500 text-sm">Please select a date first</p>
      </div>
    );
  }

  // Filter available slots
 useEffect(() => {
  if (!Array.isArray(slots)) {
    setAvailableSlots([]); 
    return;
  }

  const filtered = slots.filter((slot) => {
    const now = new Date();
    const [h, m] = slot.start_time.split(':').map(Number);

    const slotDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      h,
      m
    );

    return slotDateTime > now; // only future slots
  });

  setAvailableSlots(filtered);
}, [slots, selectedDate]);

  return (
    <div className="mb-6 px-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        🚚 Available Delivery Slots
      </h2>

      {availableSlots.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {slots.length === 0
            ? 'No delivery slots available'
            : 'All slots for selected date have passed. Please choose another date.'}
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {availableSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
              className={`rounded-xl px-4 py-3 border-2 max-w-[30%] text-left transition-colors duration-200 ${
                selectedSlotId === slot.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-400'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-black">{slot.title}</p>
                <p className="text-xs text-gray-600">
                  {formatTo12Hour(slot.start_time)} - {formatTo12Hour(slot.end_time)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliverySlotSelector;
