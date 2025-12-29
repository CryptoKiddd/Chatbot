import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";



async function seed() {
  try {
    
    const db =  await getDatabase()

    const projectsCollection = db.collection("projects");
    const apartmentsCollection = db.collection("apartments");

    // 🔥 Clear old data
    await projectsCollection.deleteMany({});
    await apartmentsCollection.deleteMany({});

    const developerName = "Black Sea Development Group";

    // ===== PROJECTS =====
    const batumiProjectId = new ObjectId();
    const tbilisiProjectId = new ObjectId();

    const projects = [
      {
        _id: batumiProjectId,
        projectName: "Palm Residence Batumi",
        city: "Batumi",
        neighborhood: "New Boulevard",
        constructionStatus: "under-construction",
        expectedCompletion: "2026-06",
        developerName,
        paymentPlans: [
          "20% down payment",
          "Installments up to 36 months",
          "0% interest"
        ]
      },
      {
        _id: tbilisiProjectId,
        projectName: "Green Hills Tbilisi",
        city: "Tbilisi",
        neighborhood: "Saburtalo",
        constructionStatus: "off-plan",
        expectedCompletion: "2027-03",
        developerName,
        paymentPlans: [
          "30% down payment",
          "Installments up to 48 months",
          "Bank mortgage available"
        ]
      }
    ];

    await projectsCollection.insertMany(projects);

    // ===== APARTMENTS =====
    const batumiApartments = Array.from({ length: 30 }, (_, i) => {
      const area = 38 + i * 1.5;
      const pricePerM2 = 1400;

      return {
        projectId: batumiProjectId.toString(),
        projectName: "Palm Residence Batumi",
        city: "Batumi",
        neighborhood: "New Boulevard",
        totalArea: Number(area.toFixed(1)),
        rooms: i < 10 ? 1 : i < 22 ? 2 : 3,
        floor: (i % 15) + 1,
        viewType: i % 3 === 0 ? "sea" : "city",
        hasBalcony: true,
        balconySize: 6 + (i % 4),
        totalPrice: Math.round(area * pricePerM2),
        minInitialInstallment: Math.round(area * pricePerM2 * 0.2),
        monthlyPayment: Math.round((area * pricePerM2 * 0.8) / 36),
        installmentDuration: 36,
        availabilityStatus: i % 7 === 0 ? "reserved" : "available",
        constructionStatus: "under-construction",
        expectedCompletion: "2026-06",
        developerName
      };
    });

    const tbilisiApartments = Array.from({ length: 30 }, (_, i) => {
      const area = 45 + i * 2;
      const pricePerM2 = 1900;

      return {
        projectId: tbilisiProjectId.toString(),
        projectName: "Green Hills Tbilisi",
        city: "Tbilisi",
        neighborhood: "Saburtalo",
        totalArea: area,
        rooms: i < 8 ? 1 : i < 20 ? 2 : 3,
        floor: (i % 18) + 1,
        viewType: i % 4 === 0 ? "park" : "city",
        hasBalcony: true,
        balconySize: 7 + (i % 5),
        totalPrice: Math.round(area * pricePerM2),
        minInitialInstallment: Math.round(area * pricePerM2 * 0.3),
        monthlyPayment: Math.round((area * pricePerM2 * 0.7) / 48),
        installmentDuration: 48,
        availabilityStatus: i % 9 === 0 ? "sold" : "available",
        constructionStatus: "off-plan",
        expectedCompletion: "2027-03",
        developerName
      };
    });

    await apartmentsCollection.insertMany([
      ...batumiApartments,
      ...tbilisiApartments
    ]);

    console.log("✅ Database seeded successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } 
}

seed();
