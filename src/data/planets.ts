export interface HotspotData {
  id: string;
  name: string;
  detail: string;
  position: [number, number, number];
}

export type TransitionVector = "fly-in-right" | "fly-in-left" | "dive-top" | "ascend-bottom" | "hyper-spiral" | "diagonal-slice";

export interface CoreLayer {
  name: string;
  depth: string;
  temp: string;
  material: string;
  color: string;
  emissive: string;
  wireframeColor: string;
}

export interface PlanetData {
  id: string;
  name: string;
  tagline: string;
  type: string;
  distanceFromSun: string;
  radius: string;
  temperature: string;
  description: string;
  color: string;
  emissive: string;
  hasRings?: boolean;
  roughness: number;
  atmosphereColor: string;
  modelRadius: number;
  position3D: [number, number, number];
  hudPosition: "left" | "right";
  cameraTarget: [number, number, number];
  // ทิศทางและวิถีการบินเฉพาะตัวของแต่ละดวงดาว (Cinematic Trajectory)
  flyTrajectory: TransitionVector;
  stats: {
    gravity: string;
    orbitalVelocity: string;
    dayLength: string;
    atmosphereType: string;
    surfaceArea: string;
    moonsCount: string;
  };
  highlightFact: string;
  hotspots: HotspotData[];
  coreData: CoreLayer[];
}

export const PLANETS: PlanetData[] = [
  // 0. THE SUN (ดวงอาทิตย์): ดวงแรกของระบบสุริยะ ลอยเปล่งประกายพลังงานมหาศาล
  {
    id: "sun",
    name: "THE SUN",
    tagline: "The Radiant Gravitational Heart",
    type: "Yellow Dwarf Star (G2V)",
    distanceFromSun: "0.00M km · 0.00 AU",
    radius: "696,340 km (109x Earth)",
    temperature: "5,500°C (Surface) / 15,000,000°C (Core)",
    description: "ดาวฤกษ์ศูนย์กลางแห่งระบบสุริยะ แหล่งกำเนิดแสงสว่าง ความอบอุ่น และพลังงานนิวเคลียร์ฟิวชันที่ค้ำจุนทุกชีวิตและควบคุมวงโคจรของดาวเคราะห์ทุกดวง",
    color: "#ffaa00",
    emissive: "#ff5500",
    roughness: 0.1,
    atmosphereColor: "#ff7700",
    modelRadius: 2.1,
    position3D: [2.5, 0, 0],
    hudPosition: "left",
    cameraTarget: [0, 0, 7.8],
    flyTrajectory: "hyper-spiral",
    stats: {
      gravity: "28.0 G (274 m/s²)",
      orbitalVelocity: "220 km/s (Galactic)",
      dayLength: "27 Earth Days",
      atmosphereType: "Hydrogen 73%, Helium 25%",
      surfaceArea: "6.09 Trillion km²",
      moonsCount: "8 Planets + Millions of Bodies",
    },
    highlightFact: "มีมวลมหาศาลคิดเป็น 99.86% ของมวลสารทั้งหมดในระบบสุริยะ และปลดปล่อยพลังงานเทียบเท่าระเบิดนิวเคลียร์นับล้านลูกทุกวินาที",
    hotspots: [
      {
        id: "sunspot",
        name: "SOLAR FLARE & SUNSPOTS",
        detail: "จุดดับบนดวงอาทิตย์และพวยก๊าซร้อนพลาสมาที่พุ่งทะลุสนามแม่เหล็กออกสู่อวกาศนับแสนกิโลเมตร",
        position: [0.3, 0.4, 1.4],
      },
    ],
    coreData: [
      { name: "PHOTOSPHERE", depth: "500 km", temp: "5,500°C", material: "Radiant Plasma", color: "#ffbb33", emissive: "#ff6600", wireframeColor: "#ffcc00" },
      { name: "RADIATIVE ZONE", depth: "350,000 km", temp: "2,000,000°C", material: "Dense Photon Trap", color: "#ff7700", emissive: "#cc3300", wireframeColor: "#ff9900" },
      { name: "THERMONUCLEAR CORE", depth: "150,000 km", temp: "15,000,000°C", material: "Proton-Proton Fusion", color: "#ffffff", emissive: "#ffaa00", wireframeColor: "#ffffff" },
    ],
  },
  // 1. MERCURY: พุ่งตัดเฉียงเข้ามาจากมุมขวาบนอย่างรวดเร็ว (ความเร็วสูงสมชื่อดาวพุธ)
  {
    id: "mercury",
    name: "MERCURY",
    tagline: "The Inner Scorched World",
    type: "Terrestrial Planet",
    distanceFromSun: "57.9M km · 0.39 AU",
    radius: "2,440 km",
    temperature: "-180°C to 430°C",
    description: "ดาวเคราะห์หินชั้นในสุดและมีขนาดเล็กที่สุดในระบบสุริยะ ไร้ชั้นบรรยากาศกักเก็บความร้อน ส่งผลให้เกิดความต่างของอุณหภูมิกลางวันและกลางคืนสูงสุดในระบบสุริยะ",
    color: "#8c8680",
    emissive: "#1f1d1a",
    roughness: 0.9,
    atmosphereColor: "#a39f99",
    modelRadius: 1.45,
    position3D: [2.5, 0, 0],
    hudPosition: "left",
    cameraTarget: [0, 0, 7.8],
    flyTrajectory: "diagonal-slice",
    stats: {
      gravity: "0.38 G",
      orbitalVelocity: "47.4 km/s",
      dayLength: "59 Earth Days",
      atmosphereType: "Trace Exosphere",
      surfaceArea: "74.8M km²",
      moonsCount: "0 Moons",
    },
    highlightFact: "โคจรรอบดวงอาทิตย์เร็วที่สุดในระบบสุริยะ ใช้เวลาเพียง 88 วันของโลกในการโคจรครบ 1 รอบปี",
    hotspots: [
      {
        id: "caloris",
        name: "CALORIS BASIN",
        detail: "หลุมอุกกาบาตขนาดมหึมากว้าง 1,550 กม. หนึ่งในร่องรอยการชนที่ใหญ่ที่สุดในระบบสุริยะ",
        position: [0.6, 0.4, 1.2],
      },
    ],
    coreData: [
      { name: "CRUST", depth: "35 km", temp: "430°C", material: "Silicate Rock", color: "#8c8680", emissive: "#000000", wireframeColor: "#a39f99" },
      { name: "MANTLE", depth: "600 km", temp: "1,200°C", material: "Solid Silicate", color: "#a85d36", emissive: "#331100", wireframeColor: "#ff7744" },
      { name: "METALLIC CORE", depth: "2,000 km", temp: "2,500°C", material: "Molten Iron-Nickel", color: "#ffaa33", emissive: "#ff5500", wireframeColor: "#ffcc00" },
    ],
  },

  // 2. VENUS: ลอยดิ่งลงมาจากด้านบนทะลุม่านเมฆหนาทึบ (Dive from Zenith)
  {
    id: "venus",
    name: "VENUS",
    tagline: "The Hyper-Thermal Enigma",
    type: "Terrestrial Planet",
    distanceFromSun: "108.2M km · 0.72 AU",
    radius: "6,052 km",
    temperature: "465°C Steady",
    description: "ดาวเคราะห์ที่มีปรากฏการณ์เรือนกระจกขั้นรุนแรง ปกคลุมด้วยเมฆกรดซัลฟิวริกหนาทึบและแรงดันบรรยากาศระดับพื้นผิวสูงกว่าโลกถึง 90 เท่า",
    color: "#e3bb76",
    emissive: "#382305",
    roughness: 0.6,
    atmosphereColor: "#ffd685",
    modelRadius: 1.75,
    position3D: [-2.5, 0, 0],
    hudPosition: "right",
    cameraTarget: [0, 0, 7.8],
    flyTrajectory: "dive-top",
    stats: {
      gravity: "0.91 G",
      orbitalVelocity: "35.0 km/s",
      dayLength: "243 Earth Days",
      atmosphereType: "Carbon Dioxide 96.5%",
      surfaceArea: "460.2M km²",
      moonsCount: "0 Moons",
    },
    highlightFact: "หมุนรอบตัวเองในทิศทางตรงกันข้ามกับดาวเคราะห์ส่วนใหญ่ และมีระยะเวลาหมุนรอบตัวเองนานกว่าวงโคจรรอบดวงอาทิตย์",
    hotspots: [
      {
        id: "maxwell",
        name: "MAXWELL MONTES",
        detail: "แนวเทือกเขาสูงที่สุดบนดาวศุกร์ สูงกว่าระดับพื้นผิวเฉลี่ยถึง 11 กิโลเมตร",
        position: [-0.5, 0.9, 1.3],
      },
    ],
    coreData: [
      { name: "CRUST", depth: "50 km", temp: "465°C", material: "Basaltic Silicate", color: "#e3bb76", emissive: "#000000", wireframeColor: "#ffd685" },
      { name: "MANTLE", depth: "3,000 km", temp: "2,000°C", material: "Silicate Rocks", color: "#b86f2a", emissive: "#441100", wireframeColor: "#ff9944" },
      { name: "METALLIC CORE", depth: "3,200 km", temp: "4,000°C", material: "Liquid Iron-Nickel", color: "#ff8800", emissive: "#aa3300", wireframeColor: "#ffcc22" },
    ],
  },

  // 3. EARTH: ลอยควงสว่านพุ่งตรงเข้ามาหาอย่างสง่างาม (Hyper Spiral / Direct Zoom)
  {
    id: "earth",
    name: "EARTH",
    tagline: "The Biospheric Haven",
    type: "Habitable Ocean World",
    distanceFromSun: "149.6M km · 1.00 AU",
    radius: "6,371 km",
    temperature: "-88°C to 58°C",
    description: "ดาวเคราะห์หินดวงเดียวในจักรวาลที่ยืนยันการดำรงอยู่ของสิ่งมีชีวิต อุดมด้วยผืนน้ำของเหลวบนพื้นผิว แผ่นธรณีแปรสัณฐาน และสนามแม่เหล็กป้องกันรังสีคอสมิก",
    color: "#1d63b8",
    emissive: "#051630",
    roughness: 0.3,
    atmosphereColor: "#59a5ff",
    modelRadius: 1.8,
    position3D: [2.5, 0, 0],
    hudPosition: "left",
    cameraTarget: [0, 0, 7.8],
    flyTrajectory: "hyper-spiral",
    stats: {
      gravity: "1.00 G",
      orbitalVelocity: "29.8 km/s",
      dayLength: "23h 56m",
      atmosphereType: "Nitrogen 78%, Oxygen 21%",
      surfaceArea: "510.1M km²",
      moonsCount: "1 Moon (Luna)",
    },
    highlightFact: "พื้นผิวกว่า 71% ปกคลุมด้วยน้ำในสถานะของเหลว เป็นรากฐานสำคัญในการวิวัฒนาการของชีวมณฑล",
    hotspots: [
      {
        id: "mariana",
        name: "MARIANA TRENCH",
        detail: "จุดลึกที่สุดในมหาสมุทรโลก ลึกกว่า 11,034 เมตร ภายใต้แรงดันมหาศาลกว่า 1,000 บาร์",
        position: [0.8, 0.2, 1.4],
      },
    ],
    coreData: [
      { name: "LITHOSPHERE", depth: "40 km", temp: "15°C", material: "Silicate Crust & Oceans", color: "#1d63b8", emissive: "#000000", wireframeColor: "#59a5ff" },
      { name: "MANTLE", depth: "2,890 km", temp: "3,700°C", material: "Viscous Silicates", color: "#cc5500", emissive: "#441100", wireframeColor: "#ff8800" },
      { name: "OUTER CORE", depth: "5,150 km", temp: "4,500°C", material: "Liquid Iron & Nickel", color: "#ff8800", emissive: "#aa3300", wireframeColor: "#ffcc00" },
      { name: "INNER CORE", depth: "6,371 km", temp: "6,000°C", material: "Solid Iron Crystal Sphere", color: "#ffffaa", emissive: "#ffaa00", wireframeColor: "#ffffff" },
    ],
  },

  // 4. MARS: สไลด์พุ่งโฉบมาจากฝั่งขวาตัดระนาบ (Fly-in from Right)
  {
    id: "mars",
    name: "MARS",
    tagline: "The Oxidized Frontier",
    type: "Terrestrial Planet",
    distanceFromSun: "227.9M km · 1.52 AU",
    radius: "3,389 km",
    temperature: "-140°C to 20°C",
    description: "ดาวเคราะห์ดินแดนทะเลทรายออกไซด์ของเหล็ก มีชั้นบรรยากาศเบาบางและมีหลักฐานทางธรณีวิทยาที่บ่งชี้ว่าเคยมีธารน้ำไหลบนพื้นผิวในอดีตยุคโบราณ",
    color: "#e25b34",
    emissive: "#3a0e05",
    roughness: 0.8,
    atmosphereColor: "#ff7a59",
    modelRadius: 1.65,
    position3D: [-2.5, 0, 0],
    hudPosition: "right",
    cameraTarget: [0, 0, 7.8],
    flyTrajectory: "fly-in-right",
    stats: {
      gravity: "0.38 G",
      orbitalVelocity: "24.1 km/s",
      dayLength: "24h 37m",
      atmosphereType: "Carbon Dioxide 95%",
      surfaceArea: "144.8M km²",
      moonsCount: "2 Moons",
    },
    highlightFact: "เป็นที่ตั้งของ Olympus Mons ภูเขาไฟที่สูงที่สุดในระบบสุริยะ และหุบเหวลึก Valles Marineris",
    hotspots: [
      {
        id: "olympus",
        name: "OLYMPUS MONS",
        detail: "ภูเขาไฟโล่ขนาดยักษ์สูง 21.9 กิโลเมตร สูงกว่ายอดเขาเอเวอเรสต์บนโลกเกือบสามเท่า",
        position: [-0.6, 0.8, 1.3],
      },
    ],
    coreData: [
      { name: "CRUST", depth: "50 km", temp: "-60°C", material: "Volcanic Basalt", color: "#e25b34", emissive: "#000000", wireframeColor: "#ff7a59" },
      { name: "MANTLE", depth: "1,500 km", temp: "1,500°C", material: "Silicate Rocks", color: "#a83e20", emissive: "#330800", wireframeColor: "#ff5522" },
      { name: "SOLID CORE", depth: "1,800 km", temp: "2,000°C", material: "Iron-Nickel & Sulfur", color: "#ff8844", emissive: "#aa2200", wireframeColor: "#ffaa00" },
    ],
  },

  // 5. JUPITER: ลอยทะยานขึ้นมาจากห้วงลึกด้านล่าง (Ascend from Bottom Abyss)
  {
    id: "jupiter",
    name: "JUPITER",
    tagline: "The Jovian Behemoth",
    type: "Gas Giant",
    distanceFromSun: "778.5M km · 5.20 AU",
    radius: "69,911 km",
    temperature: "-110°C Equilibrium",
    description: "ดาวเคราะห์ที่มีมวลมากที่สุดในระบบสุริยะ เป็นแก๊สยักษ์ที่ประกอบด้วยไฮโดรเจนและฮีเลียมเป็นหลัก มีสนามแม่เหล็กขนาดมหึมาและพายุหมุนวนแอนติไซโคลนที่ยาวนาน",
    color: "#d9a066",
    emissive: "#402008",
    roughness: 0.4,
    atmosphereColor: "#e6b980",
    modelRadius: 2.05,
    position3D: [2.5, 0, 0],
    hudPosition: "left",
    cameraTarget: [0, 0, 8.0],
    flyTrajectory: "ascend-bottom",
    stats: {
      gravity: "2.53 G",
      orbitalVelocity: "13.1 km/s",
      dayLength: "9h 56m",
      atmosphereType: "Hydrogen 90%, Helium 10%",
      surfaceArea: "6.14B km²",
      moonsCount: "95 Confirmed Moons",
    },
    highlightFact: "พายุหมุนวน Great Red Spot มีขนาดเส้นผ่านศูนย์กลางใหญ่พอที่จะบรรจุโลกไว้ภายในได้ทั้งใบ",
    hotspots: [
      {
        id: "redspot",
        name: "GREAT RED SPOT",
        detail: "พายุหมุนวนยักษ์สีแดงอิฐที่คงอยู่ต่อเนื่องมานานกว่าสามศตวรรษ ด้วยความเร็วลมกว่า 430 กม./ชม.",
        position: [0.7, -0.4, 1.6],
      },
    ],
    coreData: [
      { name: "GASEOUS ATMOSPHERE", depth: "1,000 km", temp: "-110°C", material: "Molecular Hydrogen", color: "#d9a066", emissive: "#000000", wireframeColor: "#e6b980" },
      { name: "METALLIC HYDROGEN", depth: "40,000 km", temp: "10,000°C", material: "Degenerate Liquid Metal", color: "#4488ff", emissive: "#002288", wireframeColor: "#00ddff" },
      { name: "DENSE ROCKY CORE", depth: "69,911 km", temp: "24,000°C", material: "Compressed Heavy Elements", color: "#ffeedd", emissive: "#ff8800", wireframeColor: "#ffffff" },
    ],
  },

  // 6. SATURN: ร่อนโฉบเข้าหาพร้อมวงแหวนจากปีกซ้าย (Fly-in from Left Orbit)
  {
    id: "saturn",
    name: "SATURN",
    tagline: "The Celestial Ring Complex",
    type: "Gas Giant with Rings",
    distanceFromSun: "1.434B km · 9.58 AU",
    radius: "58,232 km",
    temperature: "-140°C Effective",
    description: "ดาวเคราะห์แก๊สยักษ์ที่มีระบบวงแหวนที่กว้างขวางและซับซ้อนที่สุด ประกอบด้วยอนุภาคน้ำแข็ง ฝุ่นหิน และสารอินทรีย์บางเบาที่โคจรอย่างมีเสถียรภาพ",
    color: "#e8cf99",
    emissive: "#2e2515",
    hasRings: true,
    roughness: 0.5,
    atmosphereColor: "#f7e7c4",
    modelRadius: 1.55,
    position3D: [-2.5, 0, 0],
    hudPosition: "right",
    cameraTarget: [0, 0, 8.2],
    flyTrajectory: "fly-in-left",
    stats: {
      gravity: "1.06 G",
      orbitalVelocity: "9.7 km/s",
      dayLength: "10h 33m",
      atmosphereType: "Molecular Hydrogen 96%",
      surfaceArea: "4.27B km²",
      moonsCount: "146 Verified Moons",
    },
    highlightFact: "เป็นดาวเคราะห์ดวงเดียวในระบบสุริยะที่มีค่าความหนาแน่นเฉลี่ยน้อยกว่าน้ำของเหลว",
    hotspots: [
      {
        id: "cassini",
        name: "CASSINI DIVISION",
        detail: "ช่องว่างกว้าง 4,800 กิโลเมตรที่คั่นระหว่างวงแหวนหลัก A และ B เกิดจากแรงรบกวนโน้มถ่วง",
        position: [1.8, 0.3, 0.6],
      },
    ],
    coreData: [
      { name: "UPPER ATMOSPHERE", depth: "1,000 km", temp: "-140°C", material: "Hydrogen & Helium Clouds", color: "#e8cf99", emissive: "#000000", wireframeColor: "#f7e7c4" },
      { name: "METALLIC LIQUID", depth: "30,000 km", temp: "8,500°C", material: "Metallic Hydrogen Sea", color: "#cc9944", emissive: "#332200", wireframeColor: "#ffcc66" },
      { name: "ROCK-ICE CORE", depth: "58,232 km", temp: "11,700°C", material: "Iron, Silicate & Ice Core", color: "#ffdd88", emissive: "#aa5500", wireframeColor: "#ffffff" },
    ],
  },

  // 7. URANUS: ดิ่งหมุนระนาบเข้ามาจากมุมซ้ายบน (Diagonal Slice from Top-Left)
  {
    id: "uranus",
    name: "URANUS",
    tagline: "The Retrograde Ice Giant",
    type: "Ice Giant",
    distanceFromSun: "2.871B km · 19.2 AU",
    radius: "25,362 km",
    temperature: "-224°C Minimum",
    description: "ดาวยักษ์น้ำแข็งที่มีแกนหมุนเอียงทำมุมเกือบขนานกับระนาบสุริยวิถี มีบรรยากาศอุดมด้วยมีเทนที่ดูดซับแสงสีแดงและสะท้อนเฉดสีฟ้าเขียวอันสงบ",
    color: "#74d4d8",
    emissive: "#0c3b3d",
    roughness: 0.35,
    atmosphereColor: "#9eebed",
    modelRadius: 1.75,
    position3D: [2.5, 0, 0],
    hudPosition: "left",
    cameraTarget: [0, 0, 7.8],
    flyTrajectory: "diagonal-slice",
    stats: {
      gravity: "0.89 G",
      orbitalVelocity: "6.8 km/s",
      dayLength: "17h 14m",
      atmosphereType: "Hydrogen 83%, Helium 15%",
      surfaceArea: "8.08B km²",
      moonsCount: "28 Moons",
    },
    highlightFact: "แกนเอียง 97.8 องศาทำให้ขั้วดาวหันเข้าหาดวงอาทิตย์โดยตรง ก่อให้เกิดฤดูกาลที่ยาวนานถึง 42 ปีบนโลกต่อหนึ่งฤดู",
    hotspots: [
      {
        id: "pole",
        name: "COLLISION AXIS",
        detail: "แกนการหมุนที่เอียงระนาบ สันนิษฐานว่าเกิดจากการปะทะกับมวลสารขนาดใหญ่ในยุคเริ่มแรก",
        position: [0.1, 1.2, 0.8],
      },
    ],
    coreData: [
      { name: "METHANE HAZE", depth: "500 km", temp: "-220°C", material: "Hydrogen & Methane Fog", color: "#74d4d8", emissive: "#000000", wireframeColor: "#9eebed" },
      { name: "SUPERCRITICAL MANTLE", depth: "15,000 km", temp: "4,000°C", material: "Water, Ammonia & Methane Ices", color: "#228899", emissive: "#002233", wireframeColor: "#44ddff" },
      { name: "ROCKY SILICATE CORE", depth: "25,362 km", temp: "5,000°C", material: "Iron-Nickel & Basalt", color: "#99eedd", emissive: "#114444", wireframeColor: "#ffffff" },
    ],
  },

  // 8. NEPTUNE: ทะยานขึ้นมาจากก้นบึ้งอวกาศมืด (Ascend from Deep Abyss)
  {
    id: "neptune",
    name: "NEPTUNE",
    tagline: "The Outer Dynamic Abyss",
    type: "Ice Giant",
    distanceFromSun: "4.495B km · 30.1 AU",
    radius: "24,622 km",
    temperature: "-214°C Average",
    description: "ดาวเคราะห์ดวงนอกสุดของระบบสุริยะ โดดเด่นด้วยกระแสลมพายุความเร็วเหนือเสียงที่มีความรุนแรงที่สุด และมีดวงจันทร์ไทรทันที่มีการปะทุของไกเซอร์ไนโตรเจน",
    color: "#274687",
    emissive: "#081329",
    roughness: 0.25,
    atmosphereColor: "#4169e1",
    modelRadius: 1.75,
    position3D: [-2.5, 0, 0],
    hudPosition: "right",
    cameraTarget: [0, 0, 7.8],
    flyTrajectory: "ascend-bottom",
    stats: {
      gravity: "1.14 G",
      orbitalVelocity: "5.4 km/s",
      dayLength: "16h 06m",
      atmosphereType: "Hydrogen 80%, Helium 19%",
      surfaceArea: "7.62B km²",
      moonsCount: "16 Moons",
    },
    highlightFact: "บันทึกสถิติความเร็วลมพายุสูงสุดในระบบสุริยะ โดยวัดความเร็วได้สูงกว่า 2,100 กิโลเมตรต่อชั่วโมง",
    hotspots: [
      {
        id: "darkspot",
        name: "GREAT DARK SPOT",
        detail: "ระบบพายุหมุนขนาดมหึมาในชั้นบรรยากาศ มีพฤติกรรมการเคลื่อนที่และการสลายตัวแบบไดนามิก",
        position: [-0.6, -0.4, 1.4],
      },
    ],
    coreData: [
      { name: "UPPER EXOSPHERE", depth: "600 km", temp: "-214°C", material: "Supersonic Methane Winds", color: "#274687", emissive: "#000000", wireframeColor: "#4169e1" },
      { name: "IONIC OCEAN MANTLE", depth: "18,000 km", temp: "5,000°C", material: "Hot Dense Superionic Water", color: "#113377", emissive: "#001144", wireframeColor: "#0077ff" },
      { name: "SOLID DIAMOND CORE", depth: "24,622 km", temp: "7,000°C", material: "Crystallized Diamond & Rock", color: "#66aaff", emissive: "#0033aa", wireframeColor: "#ffffff" },
    ],
  },

  // 9. GARGANTUA (SECRET BLACK HOLE): ปรากฏการณ์หลุมดำมวลยิ่งยวดสุดอลังการ
  {
    id: "blackhole",
    name: "GARGANTUA",
    tagline: "The Supermassive Singularity",
    type: "Kerr Black Hole",
    distanceFromSun: "10 Billion AU · Deep Void",
    radius: "300 Million km (Event Horizon)",
    temperature: "10,000,000°C (Accretion Disk)",
    description: "หลุมดำมวลยิ่งยวดที่หมุนวนด้วยความเร็วใกล้แสง ล้อมรอบด้วยจานมวลสารหมุนวนเปล่งแสงพลาสมาความร้อนสูง บิดเบือนกาลอวกาศและเส้นทางเดินของแสงตามทฤษฎีสัมพัทธภาพทั่วไป",
    color: "#000000",
    emissive: "#000000",
    roughness: 0.0,
    atmosphereColor: "#ff7700",
    modelRadius: 1.6,
    position3D: [2.5, 0, 0],
    hudPosition: "left",
    cameraTarget: [0, 0, 7.8],
    flyTrajectory: "hyper-spiral",
    stats: {
      gravity: "∞ Infinite at Singularity",
      orbitalVelocity: "299,792 km/s (c)",
      dayLength: "Time Dilated (1h = 7 Years)",
      atmosphereType: "Relativistic Plasma Jet",
      surfaceArea: "None · Event Horizon",
      moonsCount: "Accretion Remnants",
    },
    highlightFact: "แรงโน้มถ่วงมหาศาลบิดเบือนเวลาจน 1 ชั่วโมงใกล้ขอบฟ้าเหตุการณ์เทียบเท่ากับ 7 ปีบนโลกมนุษย์",
    hotspots: [
      {
        id: "singularity",
        name: "EVENT HORIZON",
        detail: "เส้นขอบฟ้าเหตุการณ์ที่ไม่มีสิ่งใดแม้กระทั่งแสงสามารถหลุดรอดออกมาได้",
        position: [0.0, 0.0, 1.4],
      },
    ],
    coreData: [
      { name: "PHOTON SPHERE", depth: "1.5 Rs", temp: "10M °C", material: "Trapped Relativistic Photons", color: "#ff8800", emissive: "#ff4400", wireframeColor: "#ffcc00" },
      { name: "ERGOSPHERE", depth: "1.0 Rs", temp: "50M °C", material: "Dragged Spacetime Vortex", color: "#ff2200", emissive: "#990000", wireframeColor: "#ff4400" },
      { name: "GRAVITATIONAL SINGULARITY", depth: "0 km", temp: "Undefined", material: "Infinite Density Point", color: "#000000", emissive: "#00f0ff", wireframeColor: "#00f0ff" },
    ],
  },
];
