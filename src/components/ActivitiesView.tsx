import React, { useState } from 'react';
import { ActivityEvent } from '../types';
import { INITIAL_ACTIVITIES } from '../data/mockData';

interface ActivitiesViewProps {
  onShowToast: (msg: string) => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({ onShowToast }) => {
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'month' | 'upcoming' | 'past'>('month');
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<ActivityEvent | null>(null);

  const filterChips = [
    { id: 'all', label: 'All Events' },
    { id: 'Workshop', label: 'Workshops' },
    { id: 'Photo Walk', label: 'Photo Walks' },
    { id: 'Photo Hunt', label: 'Photo Hunts' },
    { id: 'Exhibition', label: 'Exhibitions' },
  ];

  const handleRSVP = (activityId: string) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const newStatus = !act.isEnrolled;
          return {
            ...act,
            isEnrolled: newStatus,
            statusTag: newStatus ? 'You\'re Going' : 'Open',
            enrolledSpots: newStatus ? act.enrolledSpots + 1 : act.enrolledSpots - 1,
          };
        }
        return act;
      })
    );
    const act = activities.find((a) => a.id === activityId);
    if (act?.isEnrolled) {
      onShowToast('ยกเลิกการลงทะเบียนกิจกรรมแล้ว');
    } else {
      onShowToast(`ลงทะเบียนเข้าร่วม "${act?.title}" สำเร็จ! (+30 XP)`);
    }
  };

  const filtered = activities.filter((act) => {
    const matchesSearch =
      !searchQuery.trim() ||
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeType === 'all' || act.type === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col w-full pb-24 px-4 space-y-4 pt-3">
      {/* Header info */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
          Rayongwittayakom
        </span>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Club Activities</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Learn, practice and create together with your peers.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 bg-white rounded-full px-3.5 py-2.5 flex items-center gap-2 shadow-xs border border-gray-100 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
          <span className="material-symbols-outlined text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workshops, photo walks, exhibitions..."
            className="bg-transparent border-none outline-none text-xs text-gray-900 placeholder:text-gray-400 w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Time filter tabs */}
      <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl gap-1 text-xs font-bold">
        <button
          onClick={() => setTimeFilter('month')}
          className={`py-1.5 rounded-lg transition-all ${
            timeFilter === 'month' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeFilter('upcoming')}
          className={`py-1.5 rounded-lg transition-all ${
            timeFilter === 'upcoming' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setTimeFilter('past')}
          className={`py-1.5 rounded-lg transition-all ${
            timeFilter === 'past' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'
          }`}
        >
          Past Sessions
        </button>
      </div>

      {/* Type filter chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveType(chip.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeType === chip.id
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-100'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Event Cards List */}
      <div className="space-y-4">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            {/* Event Photo Header */}
            <div className="relative h-44 w-full overflow-hidden bg-gray-900">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Top Tags */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] font-bold bg-white/90 backdrop-blur-md text-gray-900 px-2.5 py-1 rounded-full uppercase">
                  {event.type}
                </span>

                {event.isEnrolled ? (
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <span
                      className="material-symbols-outlined text-[13px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    You're Going
                  </span>
                ) : event.statusTag === 'Almost Full' ? (
                  <span className="text-[10px] font-bold bg-amber-500 text-black px-2.5 py-1 rounded-full">
                    Almost Full
                  </span>
                ) : event.statusTag === 'Waitlist Available' ? (
                  <span className="text-[10px] font-bold bg-purple-600 text-white px-2.5 py-1 rounded-full">
                    Waitlist Available
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-gray-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full">
                    Open
                  </span>
                )}
              </div>

              {/* Bottom Details on Image */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-base font-extrabold leading-snug drop-shadow-sm">
                  {event.title}
                </h3>
              </div>
            </div>

            {/* Event Body Info */}
            <div className="p-4 flex flex-col gap-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-700 text-[18px]">
                    calendar_today
                  </span>
                  <span className="font-semibold text-gray-800">{event.date}</span>
                  <span className="text-gray-400">•</span>
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-700 text-[18px]">
                    location_on
                  </span>
                  <span className="truncate">{event.location}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {event.description}
              </p>

              {/* Spots & Action Button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-800">
                    {event.enrolledSpots} / {event.totalSpots} Participants
                  </span>
                  <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${
                        event.enrolledSpots / event.totalSpots > 0.8
                          ? 'bg-amber-500'
                          : 'bg-purple-600'
                      }`}
                      style={{
                        width: `${Math.min(100, (event.enrolledSpots / event.totalSpots) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {event.isEnrolled ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTicketEvent(event)}
                      className="bg-purple-50 text-purple-800 hover:bg-purple-100 text-xs font-bold px-3 py-2 rounded-full flex items-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                      <span>View Ticket</span>
                    </button>
                    <button
                      onClick={() => handleRSVP(event.id)}
                      className="text-gray-400 hover:text-rose-600 text-xs font-bold p-1 transition-colors"
                      title="Cancel RSVP"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRSVP(event.id)}
                    className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xs active:scale-95 transition-all"
                  >
                    Book Activity (+{event.xpReward} XP)
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Modal */}
      {selectedTicketEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200 border border-purple-100">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">
                confirmation_number
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                Official E-Pass • RB Shutter Club
              </span>
              <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                {selectedTicketEvent.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {selectedTicketEvent.date} • {selectedTicketEvent.time}
              </p>
              <p className="text-xs text-gray-700 font-semibold mt-0.5">
                {selectedTicketEvent.location}
              </p>
            </div>

            {/* Simulated QR Code */}
            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
              <div className="w-36 h-36 bg-white border border-gray-300 p-2 rounded-xl flex items-center justify-center shadow-xs">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=RBSHUTTER-PASS-58492"
                  alt="QR Code Ticket"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-gray-700 mt-2">
                PASS: RB-S2-EV-9241
              </span>
              <span className="text-[10px] text-gray-400">Scan at entrance with mentor</span>
            </div>

            <button
              onClick={() => setSelectedTicketEvent(null)}
              className="w-full py-3 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
