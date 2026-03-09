import { ArrowLeft, Star, MapPin, Calendar, Users, Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import PinVerification from "@/components/PinVerification";
import { usePayment } from "@/hooks/use-wallet";

import hotelYakYeti from "@/assets/hotels/hotel-yak-yeti.jpg";
import hotelHyatt from "@/assets/hotels/hotel-hyatt.jpg";
import hotelSoaltee from "@/assets/hotels/hotel-soaltee.jpg";
import hotelShanker from "@/assets/hotels/hotel-shanker.jpg";
import hotelDwarikas from "@/assets/hotels/hotel-dwarikas.jpg";
import hotelTempleTree from "@/assets/hotels/hotel-temple-tree.jpg";

const hotels = [
  { id: "1", name: "Hotel Yak & Yeti", location: "Durbar Marg, Kathmandu", rating: 4.8, price: 12500, image: hotelYakYeti, rooms: "Deluxe, Suite, Premium" },
  { id: "2", name: "Hyatt Regency", location: "Bouddha, Kathmandu", rating: 4.7, price: 15000, image: hotelHyatt, rooms: "Standard, Deluxe, Suite" },
  { id: "3", name: "Soaltee Crowne Plaza", location: "Tahachal, Kathmandu", rating: 4.6, price: 11000, image: hotelSoaltee, rooms: "Classic, Premium, Royal" },
  { id: "4", name: "Hotel Shanker", location: "Lazimpat, Kathmandu", rating: 4.5, price: 8500, image: hotelShanker, rooms: "Heritage, Deluxe, Suite" },
  { id: "5", name: "Dwarika's Hotel", location: "Battisputali, Kathmandu", rating: 4.9, price: 18000, image: hotelDwarikas, rooms: "Heritage, Royal, Presidential" },
  { id: "6", name: "Temple Tree Resort", location: "Lakeside, Pokhara", rating: 4.6, price: 9500, image: hotelTempleTree, rooms: "Garden, Lake View, Suite" },
];

const roomTypes = [
  { type: "Standard", price: 0, label: "Base price" },
  { type: "Deluxe", price: 3000, label: "+Rs. 3,000" },
  { type: "Suite", price: 7000, label: "+Rs. 7,000" },
];

const HotelPage = () => {
  const navigate = useNavigate();
  const payment = usePayment();
  const [selectedHotel, setSelectedHotel] = useState<typeof hotels[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [selectedRoom, setSelectedRoom] = useState("Standard");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);

  const filtered = hotels.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRoomExtra = roomTypes.find((r) => r.type === selectedRoom)?.price || 0;
  const totalPrice = selectedHotel ? selectedHotel.price + selectedRoomExtra : 0;

  const resetFlow = () => {
    setSelectedHotel(null);
    setShowConfirm(false);
    setShowVerify(false);
    setBookingDone(false);
    setCheckIn("");
    setCheckOut("");
    setGuests("2");
    setSelectedRoom("Standard");
  };

  const handleBookingPayment = () => {
    payment.mutate(
      {
        amount: totalPrice,
        description: `Hotel Booking - ${selectedHotel?.name} (${selectedRoom})`,
        metadata: { hotel: selectedHotel?.name, room: selectedRoom, checkIn, checkOut, guests },
      },
      {
        onSuccess: () => { setShowVerify(false); setBookingDone(true); },
        onError: () => { setShowVerify(false); },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={() => {
            if (showVerify) setShowVerify(false);
            else if (selectedHotel && !bookingDone) showConfirm ? setShowConfirm(false) : setSelectedHotel(null);
            else navigate("/");
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">Hotel Reservations</h1>
      </div>

      {bookingDone ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center px-5 pt-16">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl">✓</motion.div>
          <h3 className="mt-6 font-display text-xl font-bold text-foreground">Booking Confirmed!</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center">{selectedHotel?.name} — {selectedRoom} Room</p>
          <p className="mt-1 text-xs text-muted-foreground">Confirmation sent to your Wallox account</p>
          <div className="mt-6 wallox-card p-4 w-full">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Hotel</span><span className="font-medium">{selectedHotel?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span className="font-medium">{selectedRoom}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span className="font-medium">{checkIn}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="font-medium">{guests}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between"><span className="text-muted-foreground">Total Paid</span><span className="font-display text-lg font-bold">Rs. {totalPrice.toLocaleString()}</span></div>
            </div>
          </div>
          <button onClick={resetFlow} className="mt-6 rounded-xl bg-secondary px-8 py-3 text-sm font-medium text-foreground">Done</button>
        </motion.div>
      ) : showVerify ? (
        <PinVerification
          summaryItems={[
            { label: "Hotel", value: selectedHotel?.name || "" },
            { label: "Room", value: selectedRoom },
            { label: "Check-in", value: checkIn },
            { label: "Check-out", value: checkOut },
            { label: "Amount", value: `Rs. ${totalPrice.toLocaleString()}` },
          ]}
          onSuccess={handleBookingPayment}
          onCancel={() => setShowVerify(false)}
        />
      ) : !selectedHotel ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-5">
          <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search hotels or locations..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
          <div className="mt-5 space-y-3">
            {filtered.map((hotel, i) => (
              <motion.button key={hotel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedHotel(hotel)}
                className="wallox-card flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-card-elevated overflow-hidden">
                <img src={hotel.image} alt={hotel.name} className="h-16 w-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{hotel.name}</p>
                  <div className="flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3 text-muted-foreground" /><p className="text-xs text-muted-foreground truncate">{hotel.location}</p></div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /><span className="text-xs font-medium text-foreground">{hotel.rating}</span></div>
                    <span className="text-xs text-primary font-semibold">Rs. {hotel.price.toLocaleString()}/night</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : !showConfirm ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pt-6">
          {/* Hotel hero image */}
          <div className="relative rounded-2xl overflow-hidden mb-5">
            <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-44 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <h2 className="font-display text-lg font-bold text-white">{selectedHotel.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-white/80" /><p className="text-xs text-white/80">{selectedHotel.location}</p></div>
                <div className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /><span className="text-xs font-medium text-white">{selectedHotel.rating}</span></div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1.5 w-full rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1.5 w-full rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Guests</label>
              <div className="mt-1.5 flex gap-2">
                {["1", "2", "3", "4"].map((g) => (
                  <button key={g} onClick={() => setGuests(g)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${guests === g ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Room Type</label>
              <div className="mt-2 space-y-2">
                {roomTypes.map((room) => (
                  <button key={room.type} onClick={() => setSelectedRoom(room.type)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors ${selectedRoom === room.type ? "bg-primary/15 ring-1 ring-primary/50" : "bg-secondary"}`}>
                    <span className="text-sm font-medium text-foreground">{room.type}</span>
                    <span className="text-xs text-muted-foreground">{room.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="wallox-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total per night</span>
                <span className="font-display text-xl font-bold text-foreground">Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => setShowConfirm(true)} disabled={!checkIn || !checkOut}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40">Reserve Now</button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-6">
          <div className="wallox-card overflow-hidden">
            <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-32 object-cover" />
            <div className="p-5">
              <h3 className="font-display text-sm font-semibold">{selectedHotel.name}</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span className="font-medium">{selectedRoom}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span className="font-medium">{checkIn}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span className="font-medium">{checkOut}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="font-medium">{guests}</span></div>
                <div className="h-px bg-border" />
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-display text-lg font-bold text-foreground">Rs. {totalPrice.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
          <button onClick={() => setShowVerify(true)} className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
            Pay Rs. {totalPrice.toLocaleString()} & Book
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default HotelPage;
