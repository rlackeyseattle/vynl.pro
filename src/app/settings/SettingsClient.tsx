"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import { 
  User, Music, Building, Image as ImageIcon, Link as LinkIcon, 
  DollarSign, ShieldCheck, Mail, Phone, Sliders, CheckCircle2, 
  Briefcase, Loader2, Save, FileText, Globe
} from "lucide-react";

interface SettingsClientProps {
  role: "BAND" | "VENUE";
  initialProfile: any;
  initialUser: any;
}

export default function SettingsClient({ role, initialProfile, initialUser }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("identity");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Common identity
  const [name, setName] = useState(initialUser?.name || initialProfile?.name || "");
  const [bio, setBio] = useState(initialProfile?.bio || initialUser?.bio || "");
  const [slug, setSlug] = useState(initialProfile?.slug || "");
  const [genre, setGenre] = useState(initialProfile?.genre || initialProfile?.genres || "");

  // Band Specific
  const [profileImage, setProfileImage] = useState(initialProfile?.profileImage || "");
  const [headerImage, setHeaderImage] = useState(initialProfile?.headerImage || "");
  const [backgroundImage, setBackgroundImage] = useState(initialProfile?.backgroundImage || "");
  
  const [spotifyUrl, setSpotifyUrl] = useState(initialProfile?.spotifyUrl || "");
  const [appleMusicUrl, setAppleMusicUrl] = useState(initialProfile?.appleMusicUrl || "");
  const [tidalUrl, setTidalUrl] = useState(initialProfile?.tidalUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(initialProfile?.youtubeUrl || "");
  const [bandcampUrl, setBandcampUrl] = useState(initialProfile?.bandcampUrl || "");
  const [soundcloudUrl, setSoundcloudUrl] = useState(initialProfile?.soundcloudUrl || "");

  const [minimumGuarantee, setMinimumGuarantee] = useState(initialProfile?.minimumGuarantee || 0);
  const [expectedDraw, setExpectedDraw] = useState(initialProfile?.expectedDraw || 0);
  
  const [isTouring, setIsTouring] = useState(!!initialProfile?.isTouring);
  const [isNational, setIsNational] = useState(!!initialProfile?.isNational);
  const [isSigned, setIsSigned] = useState(!!initialProfile?.isSigned);
  const [hasRepresentation, setHasRepresentation] = useState(!!initialProfile?.hasRepresentation);
  const [representationDetails, setRepresentationDetails] = useState(initialProfile?.representationDetails || "");
  
  const [contactEmail, setContactEmail] = useState(initialProfile?.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(initialProfile?.contactPhone || "");
  const [coverOrOriginal, setCoverOrOriginal] = useState(initialProfile?.coverOrOriginal || "BOTH");
  const [bandRider, setBandRider] = useState(initialProfile?.bandRider || "");
  const [providesPA, setProvidesPA] = useState(!!initialProfile?.providesPA);
  const [hasSoundGuy, setHasSoundGuy] = useState(!!initialProfile?.hasSoundGuy);
  const [handlesPresales, setHandlesPresales] = useState(!!initialProfile?.handlesPresales);

  // Venue Specific
  const [address, setAddress] = useState(initialProfile?.address || "");
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [bookingEmail, setBookingEmail] = useState(initialProfile?.bookingEmail || "");
  const [contactName, setContactName] = useState(initialProfile?.contactName || "");
  const [website, setWebsite] = useState(initialProfile?.website || "");
  const [venueType, setVenueType] = useState(initialProfile?.venueType || "BAR");
  const [ageRequirement, setAgeRequirement] = useState(initialProfile?.ageRequirement || "21+");
  const [averagePay, setAveragePay] = useState(initialProfile?.averagePay || "");
  const [payType, setPayType] = useState(initialProfile?.payType || "FLAT");
  const [openDates, setOpenDates] = useState(initialProfile?.openDates || "");
  const [bookingDays, setBookingDays] = useState(initialProfile?.bookingDays || "");
  
  const [interiorImage, setInteriorImage] = useState(initialProfile?.interiorImage || "");
  const [exteriorImage, setExteriorImage] = useState(initialProfile?.exteriorImage || "");
  const [stageImage, setStageImage] = useState(initialProfile?.stageImage || "");
  
  const [eventFeedUrl, setEventFeedUrl] = useState(initialProfile?.eventFeedUrl || "");
  const [targetBandsDescription, setTargetBandsDescription] = useState(initialProfile?.targetBandsDescription || "");
  const [targetBookingNights, setTargetBookingNights] = useState(initialProfile?.targetBookingNights || "");

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    const result = await updateProfile({
      name,
      bio,
      slug,
      genre,
      // Band
      profileImage,
      headerImage,
      backgroundImage,
      minimumGuarantee: Number(minimumGuarantee),
      expectedDraw: Number(expectedDraw),
      isTouring,
      isNational,
      isSigned,
      hasRepresentation,
      representationDetails,
      contactEmail,
      contactPhone,
      coverOrOriginal,
      bandRider,
      providesPA,
      hasSoundGuy,
      handlesPresales,
      spotifyUrl,
      appleMusicUrl,
      tidalUrl,
      youtubeUrl,
      bandcampUrl,
      soundcloudUrl,
      // Venue
      address,
      phone,
      bookingEmail,
      contactName,
      website,
      venueType,
      ageRequirement,
      averagePay,
      payType,
      openDates,
      bookingDays,
      interiorImage,
      exteriorImage,
      stageImage,
      eventFeedUrl,
      targetBandsDescription,
      targetBookingNights
    });

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      router.refresh();
      // Redirect to the updated slug profile if set
      const profilePath = result.slug ? `/${result.slug}` : `/profiles/${initialProfile?.id}`;
      setTimeout(() => {
        router.push(profilePath);
      }, 1500);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update profile." });
      setLoading(false);
    }
  };

  const isBand = role === "BAND";

  const bandTabs = [
    { id: "identity", label: "Identity", icon: <User className="w-4 h-4" /> },
    { id: "media", label: "Streaming & Media", icon: <LinkIcon className="w-4 h-4" /> },
    { id: "logistics", label: "Logistics", icon: <Sliders className="w-4 h-4" /> },
    { id: "technical", label: "Tech & Rider", icon: <Briefcase className="w-4 h-4" /> },
    { id: "visuals", label: "Visuals", icon: <ImageIcon className="w-4 h-4" /> },
  ];

  const venueTabs = [
    { id: "identity", label: "Details", icon: <Building className="w-4 h-4" /> },
    { id: "logistics", label: "Requirements", icon: <Sliders className="w-4 h-4" /> },
    { id: "visuals", label: "Gallery", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "feeds", label: "Feeds & Calendar", icon: <Globe className="w-4 h-4" /> },
  ];

  const tabs = isBand ? bandTabs : venueTabs;

  return (
    <div className="min-h-screen bg-[#07070c] py-16 px-4 md:px-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800/80 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Profile Questionnaire
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Build your modern, streamlined {isBand ? "EPK" : "Venue details"}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3.5 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-pink-600/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-sm border flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" 
              : "bg-red-950/40 border-red-500/30 text-red-400"
          }`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Tabs Sidebar */}
          <div className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase transition-all duration-200 border whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-pink-600/10 border-pink-500/30 text-pink-400 shadow-md"
                    : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="md:col-span-3 glass bg-zinc-950/40 rounded-3xl border border-zinc-850 p-6 md:p-8 space-y-6">
            
            {/* ── IDENTITY TAB (Both) ─────────────────────────────────────── */}
            {activeTab === "identity" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Name</label>
                    <input 
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder={isBand ? "e.g. The Midnight Echo" : "e.g. The Outpost"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Custom URL (Slug)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-bold text-zinc-500">vynl.pro/</span>
                      <input 
                        type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-20 pr-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                        placeholder="your-custom-url"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Primary Genre / Music Type</label>
                    <input 
                      type="text" value={genre} onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder={isBand ? "e.g. Indie Rock / Synthwave" : "e.g. Rock, Indie, Electronic"}
                    />
                  </div>
                  {!isBand && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Venue Address</label>
                      <input 
                        type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                        placeholder="123 Main St, Kalispell, MT"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">About / Biography / vision</label>
                  <textarea 
                    value={bio} onChange={(e) => setBio(e.target.value)} rows={5}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 resize-none"
                    placeholder="Tell us your story..."
                  />
                </div>

                {!isBand && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Contact Phone</label>
                      <input 
                        type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                        placeholder="e.g. (406) 555-0192"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Booking Email</label>
                      <input 
                        type="email" value={bookingEmail} onChange={(e) => setBookingEmail(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                        placeholder="booking@venue.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Website</label>
                      <input 
                        type="text" value={website} onChange={(e) => setWebsite(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                        placeholder="https://venue.com"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STREAMING & MEDIA TAB (Bands) ─────────────────────────────── */}
            {activeTab === "media" && isBand && (
              <div className="space-y-6">
                <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider border-b border-zinc-900 pb-3">Link your streaming platform URLs</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Spotify URL</label>
                    <input 
                      type="text" value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="https://open.spotify.com/track/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">YouTube Video / Playlist URL</label>
                    <input 
                      type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">SoundCloud URL</label>
                    <input 
                      type="text" value={soundcloudUrl} onChange={(e) => setsoundcloudUrl(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="https://soundcloud.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Apple Music URL</label>
                    <input 
                      type="text" value={appleMusicUrl} onChange={(e) => setAppleMusicUrl(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="https://music.apple.com/us/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Tidal Track URL</label>
                    <input 
                      type="text" value={tidalUrl} onChange={(e) => setTidalUrl(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="https://tidal.com/browse/track/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Bandcamp URL</label>
                    <input 
                      type="text" value={bandcampUrl} onChange={(e) => setBandcampUrl(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="https://artist.bandcamp.com/track/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── LOGISTICS TAB (Bands) ─────────────────────────────── */}
            {activeTab === "logistics" && isBand && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Minimum Pay Guarantee ($)</label>
                    <div className="relative flex items-center">
                      <DollarSign className="w-4 h-4 text-zinc-500 absolute left-4" />
                      <input 
                        type="number" value={minimumGuarantee} onChange={(e) => setMinimumGuarantee(Number(e.target.value))}
                        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                        placeholder="e.g. 500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Average Local Draw (Bandshell Capacity)</label>
                    <input 
                      type="number" value={expectedDraw} onChange={(e) => setExpectedDraw(Number(e.target.value))}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Performance Type</label>
                    <select 
                      value={coverOrOriginal} onChange={(e) => setCoverOrOriginal(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 appearance-none"
                    >
                      <option value="BOTH">Originals & Covers</option>
                      <option value="ORIGINAL">Originals Only</option>
                      <option value="COVER">Covers Only</option>
                      <option value="TRIBUTE">Tribute Act</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950/40 rounded-2xl border border-zinc-900 grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-zinc-300 uppercase">
                    <input 
                      type="checkbox" checked={isTouring} onChange={(e) => setIsTouring(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                    />
                    <span>Touring Act</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-zinc-300 uppercase">
                    <input 
                      type="checkbox" checked={isNational} onChange={(e) => setIsNational(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                    />
                    <span>National Outreach</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-zinc-300 uppercase">
                    <input 
                      type="checkbox" checked={isSigned} onChange={(e) => setIsSigned(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                    />
                    <span>Signed to Label</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-zinc-300 uppercase">
                    <input 
                      type="checkbox" checked={hasRepresentation} onChange={(e) => setHasRepresentation(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                    />
                    <span>Has Representation / Management</span>
                  </label>
                </div>

                {hasRepresentation && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Agency / Management Details</label>
                    <input 
                      type="text" value={representationDetails} onChange={(e) => setRepresentationDetails(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g. CAA - Booking Agent: John Doe"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── TECHNICAL & RIDER TAB (Bands) ─────────────────────────────── */}
            {activeTab === "technical" && isBand && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Contact Email</label>
                    <input 
                      type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="booking@bandname.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Contact Phone</label>
                    <input 
                      type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g. (206) 555-0155"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Band Technical Rider & Requirements</label>
                  <textarea 
                    value={bandRider} onChange={(e) => setBandRider(e.target.value)} rows={6}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 resize-none font-mono text-xs"
                    placeholder="Provide technical stage configurations, inputs, or rider agreements here..."
                  />
                </div>

                <div className="p-4 bg-zinc-950/40 rounded-2xl border border-zinc-900 grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-zinc-300 uppercase">
                    <input 
                      type="checkbox" checked={providesPA} onChange={(e) => setProvidesPA(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                    />
                    <span>Provide Own PA</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-zinc-300 uppercase">
                    <input 
                      type="checkbox" checked={hasSoundGuy} onChange={(e) => setHasSoundGuy(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                    />
                    <span>Have Sound Engineer</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-zinc-300 uppercase">
                    <input 
                      type="checkbox" checked={handlesPresales} onChange={(e) => setHandlesPresales(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                    />
                    <span>Pre-sale Tickets</span>
                  </label>
                </div>
              </div>
            )}

            {/* ── VISUALS & IMAGES TAB (Both) ───────────────────────────────── */}
            {activeTab === "visuals" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {isBand ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Profile Avatar Image URL</label>
                        <input 
                          type="text" value={profileImage} onChange={(e) => setProfileImage(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                          placeholder="https://images.unsplash.com/... (Image URL)"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Header Hero Image URL</label>
                        <input 
                          type="text" value={headerImage} onChange={(e) => setHeaderImage(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                          placeholder="https://images.unsplash.com/... (Image URL)"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Profile Page Background Image URL (Parallax Override)</label>
                        <input 
                          type="text" value={backgroundImage} onChange={(e) => setBackgroundImage(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                          placeholder="https://images.unsplash.com/... (Image URL)"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Venue Exterior Image URL</label>
                        <input 
                          type="text" value={exteriorImage} onChange={(e) => setExteriorImage(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                          placeholder="https://images.unsplash.com/... (Image URL)"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Venue Interior Image URL</label>
                        <input 
                          type="text" value={interiorImage} onChange={(e) => setInteriorImage(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                          placeholder="https://images.unsplash.com/... (Image URL)"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Stage Photo URL</label>
                        <input 
                          type="text" value={stageImage} onChange={(e) => setStageImage(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                          placeholder="https://images.unsplash.com/... (Image URL)"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── REQUIREMENTS TAB (Venues) ─────────────────────────────────── */}
            {activeTab === "logistics" && !isBand && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Venue Type</label>
                    <select 
                      value={venueType} onChange={(e) => setVenueType(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 appearance-none"
                    >
                      <option value="BAR">Bar / Tavern</option>
                      <option value="CLUB">Nightclub / Music Hall</option>
                      <option value="BREWERY">Brewery / Distillery</option>
                      <option value="THEATER">Theater / Auditorium</option>
                      <option value="STADIUM">Arena / Stadium</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Age Requirements</label>
                    <input 
                      type="text" value={ageRequirement} onChange={(e) => setAgeRequirement(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g. 21+ Required or All Ages"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Average Gig Compensation ($ / split)</label>
                    <input 
                      type="text" value={averagePay} onChange={(e) => setAveragePay(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g. $500 - $1500 or 70% Door"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Payment Structure (Pay Type)</label>
                    <select 
                      value={payType} onChange={(e) => setPayType(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 appearance-none"
                    >
                      <option value="FLAT">Flat Guarantee Fee</option>
                      <option value="DOOR">Door Split %</option>
                      <option value="COVER">Ticket Cover Cut</option>
                      <option value="BAR_TAB">Drink Tab + Food</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Nights / Days typically booking</label>
                    <input 
                      type="text" value={bookingDays} onChange={(e) => setBookingDays(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g. Thu, Fri, Sat"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Specific Nights targeting (Nights to Book)</label>
                    <input 
                      type="text" value={targetBookingNights} onChange={(e) => setTargetBookingNights(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g. Thursday Acoustic showcase, Friday Alt Rock"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Bands we look for / Target profiles</label>
                  <textarea 
                    value={targetBandsDescription} onChange={(e) => setTargetBandsDescription(e.target.value)} rows={3}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 resize-none"
                    placeholder="Describe the type of music or crowd-drawing capability you are looking for..."
                  />
                </div>
              </div>
            )}

            {/* ── FEEDS TAB (Venues) ────────────────────────────────────────── */}
            {activeTab === "feeds" && !isBand && (
              <div className="space-y-6">
                <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider border-b border-zinc-900 pb-3">Integrate event feeds and calendar schedules</p>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">External Calendar Feed URL (iCal/RSS)</label>
                    <input 
                      type="text" value={eventFeedUrl} onChange={(e) => setEventFeedUrl(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="https://calendar.google.com/.../basic.ics or RSS feed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Upcoming Booking Availability Summary</label>
                    <input 
                      type="text" value={openDates} onChange={(e) => setOpenDates(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g. Open slots for June 12-14, July 2-5"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
