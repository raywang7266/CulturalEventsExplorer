/*
Student Name : QIAN Ziyue
Student ID   : 1155233243
Student Name : ZHU Chunxuan
Student ID   : 1155233366
Student Name : XIONG Meini
Student ID   : 1155233445
Student Name : WANG Ziji
Student ID   : 1155233196
Student Name : WANG Yiran
Student ID   : 1155233101
*/
// server/utils/dataImporter.js
import axios from "axios";
import { parseStringPromise } from "xml2js";
import NodeGeocoder from "node-geocoder";
import Location from "../models/Location.js";
import Event from "../models/Event.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVENT_URL = "https://www.lcsd.gov.hk/datagovhk/event/events.xml";
const VENUE_URL = "https://www.lcsd.gov.hk/datagovhk/event/venues.xml";
const EVENTDATES_URL = "https://www.lcsd.gov.hk/datagovhk/event/eventDates.xml";

const geocoder = NodeGeocoder({
  provider: "openstreetmap",
  httpAdapter: "axios",
  formatter: null,
});

// Initialize official district boundary data from JSON file
let officialDistricts = null;
const initOfficialDistricts = async () => {
  if (officialDistricts) return;
  const jsonPath = path.join(__dirname, "./data/hk-districts-official.json");
  try {
    const jsonData = await fs.readFile(jsonPath, "utf8");
    const parsedData = JSON.parse(jsonData);
    officialDistricts = parsedData.features.map((feature) => ({
      name: feature.properties.District || "Others",
      polygon: feature.geometry.coordinates[0].map((coord) => ({
        lng: coord[0],
        lat: coord[1],
      })),
    }));
  } catch (err) {
    officialDistricts = [];
  }
};

// Helper function: Check if a point (lat/lng) lies within a polygon (for district matching)
const pointInPolygon = (point, polygon) => {
  const { lat: y, lng: x } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng,
      yi = polygon[i].lat;
    const xj = polygon[j].lng,
      yj = polygon[j].lat;

    const isYCross = yi > y !== yj > y;
    const xIntersect = x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    const intersect = isYCross && xIntersect;

    if (intersect) inside = !inside;
  }
  return inside;
};

//Main function for the entire data import process
export const importCulturalData = async () => {
  try {
    await initOfficialDistricts();
    const CURRENT_IMPORT_TIME = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" })
    );

    // Helper: Convert 8-digit date string (e.g., 20231231) to Date object
    const eightDigitToDate = (eightDigitStr) => {
      if (!eightDigitStr || eightDigitStr.length !== 8) return null;
      const year = eightDigitStr.slice(0, 4);
      const month = eightDigitStr.slice(4, 6) - 1;
      const day = eightDigitStr.slice(6, 8);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    };

    // 1. Parse eventDates.xml and map event IDs to their dates (filter future dates)
    let eventIdToDateMap = new Map();
    let eventIdToRawDateMap = new Map();
    try {
      const eventDatesResponse = await axios.get(EVENTDATES_URL, {
        timeout: 30000,
      });
      const eventDatesXml = eventDatesResponse.data;
      const eventDatesJson = await parseStringPromise(eventDatesXml);
      const eventDateNodes = eventDatesJson?.event_dates?.event || [];

      eventDateNodes.forEach((eventNode) => {
        const eventId = eventNode.$?.id;
        const allEightDigitDates = eventNode?.indate || [];

        const allEventDates = [];
        const allRawDates = [];
        allEightDigitDates.forEach((dateStr) => {
          const eventDate = eightDigitToDate(dateStr);
          if (eventDate) {
            allEventDates.push(eventDate);
            allRawDates.push(dateStr);
          }
        });

        if (eventId && allEventDates.length > 0) {
          eventIdToDateMap.set(eventId, allEventDates);
          eventIdToRawDateMap.set(eventId, allRawDates);
        }
      });
    } catch (err) {
      console.error("Failed to parse eventDates.xml:", err.message);
      return {
        success: false,
        error: `Event dates parse failed: ${err.message}`,
      };
    }

    // 2. Fetch and parse events.xml, filter for future events
    const eventsResponse = await axios.get(EVENT_URL, { timeout: 30000 });
    const eventsXml = eventsResponse.data;
    const eventsJson = await parseStringPromise(eventsXml);
    const events = eventsJson.events.event || [];

    const futureEvents = events.filter((e) => {
      const eventId = e.$.id;
      const allEventDates = eventIdToDateMap.get(eventId) || [];
      return allEventDates.some((date) => date > CURRENT_IMPORT_TIME);
    });
    

    // 3. Fetch and parse venues.xml, filter venues with sufficient future events
    const venuesResponse = await axios.get(VENUE_URL, { timeout: 30000 });
    const venuesXml = venuesResponse.data;
    const venuesJson = await parseStringPromise(venuesXml);
    let venueList = venuesJson.venues.venue || [];


    const venueFutureEventCounts = {};
    futureEvents.forEach((e) => {
      const venueId = e.venueid[0];
      venueFutureEventCounts[venueId] =
        (venueFutureEventCounts[venueId] || 0) + 1;
    });

    const venuesWithEnoughEvents = venueList.filter((v) => {
      const venueId = v.$.id;
      return venueFutureEventCounts[venueId] >= 3;
    });
    

    // Helpers: Venue ID prefix extraction and XML coordinate validation
    const getVenueIdPrefix = (venueId) =>
      (venueId || "").toString().slice(0, 3).toUpperCase();
    const hasValidXmlLatLng = (v) => {
      const lat = v.latitude?.[0];
      const lng = v.longitude?.[0];
      return !!lat && !!lng && !isNaN(Number(lat)) && !isNaN(Number(lng));
    };

    // Build priority candidate pool
    const usedPrefixes = new Set();
    const addedVenueIds = new Set();
    const priorityCandidatePool = [];

    // Tier 1: Unique prefix + valid XML coordinates
    venuesWithEnoughEvents.forEach((v) => {
      const prefix = getVenueIdPrefix(v.$.id);
      const venueId = v.$.id;
      if (
        hasValidXmlLatLng(v) &&
        !usedPrefixes.has(prefix) &&
        !addedVenueIds.has(venueId)
      ) {
        priorityCandidatePool.push(v);
        usedPrefixes.add(prefix);
        addedVenueIds.add(venueId);
      }
    });

    // Tier 2: Unique prefix + no XML coordinates
    venuesWithEnoughEvents.forEach((v) => {
      const prefix = getVenueIdPrefix(v.$.id);
      const venueId = v.$.id;
      if (
        !hasValidXmlLatLng(v) &&
        !usedPrefixes.has(prefix) &&
        !addedVenueIds.has(venueId)
      ) {
        priorityCandidatePool.push(v);
        usedPrefixes.add(prefix);
        addedVenueIds.add(venueId);
      }
    });

    // Tier 3: Relaxed prefix + valid XML coordinates
    venuesWithEnoughEvents.forEach((v) => {
      const venueId = v.$.id;
      if (hasValidXmlLatLng(v) && !addedVenueIds.has(venueId)) {
        priorityCandidatePool.push(v);
        addedVenueIds.add(venueId);
      }
    });

    // Tier 4: Remaining qualified venues
    venuesWithEnoughEvents.forEach((v) => {
      const venueId = v.$.id;
      if (!addedVenueIds.has(venueId)) {
        priorityCandidatePool.push(v);
        addedVenueIds.add(venueId);
      }
    });

    // Helper: Geocode address (up to 3 attempts) with timeout
    const geocodeAddress = async (chineseAddr, englishAddr) => {
      const addressList = [
        chineseAddr,
        englishAddr,
        `${chineseAddr}, 香港`,
        `${englishAddr}, Hong Kong`,
      ].filter((addr) => !!addr);

      let finalLat = null;
      let finalLng = null;

      for (let i = 0; i < Math.min(addressList.length, 3); i++) {
        try {
          const addr = addressList[i];
          const res = await Promise.race([
            geocoder.geocode(addr),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Geocode timeout")), 5000)
            ),
          ]);

          if (res && res.length > 0) {
            finalLat = res[0].latitude;
            finalLng = res[0].longitude;
            break;
          }
        } catch (err) {
          console.warn(`Geocode attempt ${i + 1} failed:`, err.message);
          continue;
        }
      }
      return { latitude: finalLat, longitude: finalLng };
    };

    // Select final 10 venues with coordinate processing
    const finalVenuesToImport = [];
    const latLngOffsetMap = new Map();

    for (const v of priorityCandidatePool) {
      if (finalVenuesToImport.length >= 10) break;

      let latitude = v.latitude?.[0] ? Number(v.latitude[0]) : null;
      let longitude = v.longitude?.[0] ? Number(v.longitude[0]) : null;
      let isCoordinateValid =
        !!latitude && !!longitude && !isNaN(latitude) && !isNaN(longitude);

      if (!isCoordinateValid) {
        const { latitude: geoLat, longitude: geoLng } = await geocodeAddress(
          v.venuec[0],
          v.venuee[0]
        );
        latitude = geoLat;
        longitude = geoLng;
        isCoordinateValid =
          !!latitude && !!longitude && !isNaN(latitude) && !isNaN(longitude);
      }

      if (isCoordinateValid) {
        // Add tiny offset for duplicate coordinates (avoid map overlap)
        const key = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        const offsetCount = latLngOffsetMap.get(key) || 0;
        if (offsetCount > 0) {
          latitude += 0.0001 * offsetCount;
          longitude += 0.0001 * offsetCount;
        }
        latLngOffsetMap.set(key, offsetCount + 1);

        finalVenuesToImport.push({
          venueData: v,
          latitude,
          longitude,
        });
      }
    }

    if (finalVenuesToImport.length < 10) {
      const fallbackVenues = venuesWithEnoughEvents.filter((v) => {
        const prefix = getVenueIdPrefix(v.$.id);
        const isNotSelected = !finalVenuesToImport.some(
          (item) => item.venueData.$.id === v.$.id
        );
        const isPrefixUnique = !Array.from(finalVenuesToImport).some((item) => {
          return getVenueIdPrefix(item.venueData.$.id) === prefix;
        });
        return isNotSelected && isPrefixUnique;
      });

      for (const v of fallbackVenues) {
        if (finalVenuesToImport.length >= 10) break;
        finalVenuesToImport.push({
          venueData: v,
          latitude: null,
          longitude: null,
        });
      }
    }

    if (finalVenuesToImport.length < 10) {
      const finalFallbackVenues = venuesWithEnoughEvents.filter((v) => {
        return !finalVenuesToImport.some(
          (item) => item.venueData.$.id === v.$.id
        );
      });

      for (const v of finalFallbackVenues) {
        if (finalVenuesToImport.length >= 10) break;
        finalVenuesToImport.push({
          venueData: v,
          latitude: null,
          longitude: null,
        });
      }
    }

    // Prepare and save Location data
    const locationMap = new Map();
    const venueMap = new Map();

    for (const { venueData, latitude, longitude } of finalVenuesToImport) {
      const v = venueData;
      venueMap.set(v.$.id, {
        venueId: v.$.id,
        name: v.venuec[0],
        nameEn: v.venuee[0],
        address: v.venuec[0],
        addressEn: v.venuee[0],
        latitude,
        longitude,
      });
      const district = await extractDistrict(
        latitude,
        longitude,
        v.venuec[0],
        v.venuee[0]
      );

      const newLocation = new Location({
        venueId: v.$.id,
        name: v.venuec[0],
        nameEn: v.venuee[0],
        address: v.venuec[0],
        addressEn: v.venuee[0],
        district: district,
        latitude,
        longitude,
        eventCount: venueFutureEventCounts[v.$.id] || 0,
      });
      locationMap.set(v.$.id, newLocation);
    }

    const importedLocations = Array.from(locationMap.values());

    await Location.deleteMany({});
    await Event.deleteMany({});

    const savedLocations = importedLocations.filter((loc) => {
      return loc.eventCount >= 3;
    });

    const validLatLngCount = savedLocations.filter(
      (loc) =>
        loc.latitude &&
        loc.longitude &&
        !isNaN(loc.latitude) &&
        !isNaN(loc.longitude)
    ).length;
    const noLatLngCount = savedLocations.length - validLatLngCount;
    

    await Location.insertMany(savedLocations);

    const locationIdMap = new Map();
    savedLocations.forEach((loc) => locationIdMap.set(loc.venueId, loc._id));

    //map events to locations and format dates
    const formatRawDateToReadable = (rawEightDigit) => {
      if (!rawEightDigit || rawEightDigit.length !== 8) return "Unknown Date";
      return `${rawEightDigit.slice(0, 4)}-${rawEightDigit.slice(
        4,
        6
      )}-${rawEightDigit.slice(6, 8)}`;
    };

    const finalEvents = [];
    const eventMap = new Map();

    futureEvents.forEach((e) => {
      if (!locationIdMap.has(e.venueid[0])) return;
      const xmlEventId = e.$.id;
      const allFutureRawDates = eventIdToRawDateMap.get(xmlEventId) || [];
      if (allFutureRawDates.length === 0) return;
      if (eventMap.has(xmlEventId)) return;
      const allReadableDates = allFutureRawDates.map((rawDate) =>
        formatRawDateToReadable(rawDate)
      );

      // Prepare and save Event data
      const newEvent = {
        eventId: xmlEventId,
        title: e.titlec ? e.titlec[0] : null,
        titleEn: e.titlee ? e.titlee[0] : null,
        venueId: e.venueid[0],
        locationId: locationIdMap.get(e.venueid[0]),
        date: allReadableDates,
        description: e.desce ? e.desce[0] : null,
        presenter: e.presenterorge ? e.presenterorge[0] : null,
        price: e.pricee ? e.pricee[0] : null,
        detailUrl: e.urle ? e.urle[0] : null,
        ticketUrl: e.targenturle ? e.targenturle[0] : null,
      };

      finalEvents.push(newEvent);
      eventMap.set(xmlEventId, true);
    });

    await Event.insertMany(finalEvents, { ordered: false });
    await Location.updateMany({}, { $set: { lastUpdated: new Date() } });
    return {
      success: true,
      locations: savedLocations.length,
      events: finalEvents.length,
    };
  } catch (error) {
    console.error("Data import failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Define district keyword mappings for address-based matching
const districtGeoBounds = [
  {
    name: "Central & Western",
    cnKeywords: [
      "中環",
      "西環",
      "上環",
      "中西區",
      "半山",
      "堅尼地城",
      "石塘咀",
    ],
    enKeywords: ["central", "western", "sheungwan", "kennedytown"],
  },
  {
    name: "Wan Chai",
    cnKeywords: ["灣仔", "銅鑼灣", "跑馬地", "大坑"],
    enKeywords: ["wanchai", "causewaybay", "happyvalley"],
  },
  {
    name: "Eastern",
    cnKeywords: ["柴灣", "北角", "鰂魚涌", "東區", "西灣河", "筲箕灣"],
    enKeywords: ["eastern", "chaiwan", "northpoint", "quarrybay"],
  },
  {
    name: "Southern",
    cnKeywords: ["香港仔", "鴨脷洲", "南區", "薄扶林", "淺水灣", "赤柱"],
    enKeywords: ["southern", "aberdeen", "apleichau", "stanley"],
  },
  {
    name: "Yau Tsim Mong",
    cnKeywords: ["油麻地", "尖沙咀", "旺角", "油尖旺", "佐敦"],
    enKeywords: ["yautsimmong", "yaumatei", "tsimshatsui", "mongkok"],
  },
  {
    name: "Sham Shui Po",
    cnKeywords: ["深水埗", "長沙灣", "荔枝角"],
    enKeywords: ["shamshuipo", "cheungshawan", "laichikok"],
  },
  {
    name: "Kowloon City",
    cnKeywords: ["九龍城", "紅磡", "土瓜灣", "何文田", "啟德"],
    enKeywords: ["kowlooncity", "hunghom", "tokwawan", "homantin"],
  },
  {
    name: "Wong Tai Sin",
    cnKeywords: ["黃大仙", "慈雲山", "鑽石山"],
    enKeywords: ["wongtaisinn", "tszwanshan", "diamondhill"],
  },
  {
    name: "Kwun Tong",
    cnKeywords: ["觀塘", "藍田", "九龍灣", "牛頭角"],
    enKeywords: ["kwuntong", "lamtin", "kowloonbay", "ngautaukok"],
  },
  {
    name: "Kwai Tsing",
    cnKeywords: ["葵青", "青衣", "荔景", "葵涌", "葵芳"],
    enKeywords: ["kwai tsing", "tsingyi", "laiking", "kwaichung"],
  },
  {
    name: "Tsuen Wan",
    cnKeywords: ["荃灣", "深井", "青龍頭"],
    enKeywords: ["tsuenwan", "shamtseng", "tsinglungtau"],
  },
  {
    name: "Tuen Mun",
    cnKeywords: ["屯門", "掃管笏", "藍地"],
    enKeywords: ["tuenmun", "sokwunwat", "lamtei"],
  },
  {
    name: "Yuen Long",
    cnKeywords: ["元朗", "天水圍", "朗屏", "錦田"],
    enKeywords: ["yuenlong", "tinshuiwai", "longping", "kamtin"],
  },
  {
    name: "North",
    cnKeywords: ["上水", "粉嶺", "古洞", "打鼓嶺"],
    enKeywords: ["north", "sheungshui", "fanling", "kwutung"],
  },
  {
    name: "Tai Po",
    cnKeywords: ["大埔", "太和", "汀角", "船灣"],
    enKeywords: ["taipo", "taiwo", "tingkok", "plovercove"],
  },
  {
    name: "Sha Tin",
    cnKeywords: ["沙田", "馬鞍山", "大圍", "火炭"],
    enKeywords: ["shatin", "maonshan", "taiwai", "fo tan"],
  },
  {
    name: "Sai Kung",
    cnKeywords: ["西貢", "將軍澳", "坑口", "寶琳"],
    enKeywords: ["saikung", "tsuenwano", "hanghau", "polam"],
  },
  {
    name: "Islands",
    cnKeywords: ["離島", "長洲", "大嶼山", "南丫島", "東涌"],
    enKeywords: ["islands", "cheungchau", "lantau", "lamma", "tungchung"],
  },
];

// Helper: Determine district from coordinates or address keywords
export const extractDistrict = async (
  lat = null,
  lng = null,
  chineseAddr = "",
  englishAddr = ""
) => {
  await initOfficialDistricts();
  // 1. Match via coordinate-polygon intersection if coordinates exist
  if (
    typeof lat === "number" &&
    !isNaN(lat) &&
    typeof lng === "number" &&
    !isNaN(lng)
  ) {
    const targetPoint = { lat, lng };
    for (const district of officialDistricts) {
      if (pointInPolygon(targetPoint, district.polygon)) {
        return district.name;
      }
    }
  }
  // 2. Fallback: Match via address keywords
  // Chinese Address
  const processedChinese = chineseAddr
    .replace(/\s+|，|。|、|（|）|【|】|「|」/g, "")
    .toUpperCase();
  for (const district of districtGeoBounds) {
    const isMatch = district.cnKeywords.some((key) =>
      processedChinese.includes(key.toUpperCase())
    );
    if (isMatch) return district.name;
  }

  // English Address
  const processedEnglish = englishAddr
    .replace(/\s+|,|\.|-|\(|\)/g, "")
    .toLowerCase();
  for (const district of districtGeoBounds) {
    const isMatch = district.enKeywords.some((key) =>
      processedEnglish.includes(key.toLowerCase())
    );
    if (isMatch) return district.name;
  }
  return "Others";
};
