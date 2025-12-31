import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';
import { Apartment, Project, ILead, Session, UserPreferences } from '../types';

// Database Models with CRUD operations

export class ApartmentModel {
  private static async getCollection(): Promise<Collection> {
    const db = await getDatabase();
    return db.collection('apartments');
  }

  static async findById(id: string): Promise<Apartment | null> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ _id: new ObjectId(id) });
    return result as Apartment | null;
  }

  static async findAll(limit: number = 100): Promise<Apartment[]> {
    const collection = await this.getCollection();
    const results = await collection.find({}).limit(limit).toArray();
    return results as Apartment[];
  }

  static async findAvailable(): Promise<Apartment[]> {
    const collection = await this.getCollection();
    const results = await collection.find({ 
      availabilityStatus: 'available' 
    }).toArray();
    return results as Apartment[];
  }

  static async findByProject(projectId: string): Promise<Apartment[]> {
    const collection = await this.getCollection();
    const results = await collection.find({ projectId }).toArray();
    return results as Apartment[];
  }

  static async search(filters: any): Promise<Apartment[]> {
    const collection = await this.getCollection();
    const results = await collection.find(filters).toArray();
    return results as Apartment[];
  }

  static async create(apartment: Omit<Apartment, '_id'>): Promise<ObjectId> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(apartment);
    return result.insertedId;
  }

  static async update(id: string, updates: Partial<Apartment>): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }

  static async updateStatus(id: string, status: 'available' | 'reserved' | 'sold'): Promise<boolean> {
    return this.update(id, { availabilityStatus: status });
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async countByStatus(): Promise<Record<string, number>> {
    const collection = await this.getCollection();
    const results = await collection.aggregate([
      {
        $group: {
          _id: '$availabilityStatus',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    return results.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }

  static async getPriceRange(): Promise<{ min: number; max: number }> {
    const collection = await this.getCollection();
    const result = await collection.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$totalPrice' },
          maxPrice: { $max: '$totalPrice' }
        }
      }
    ]).toArray();

    if (result.length > 0) {
      return {
        min: result[0].minPrice,
        max: result[0].maxPrice
      };
    }
    return { min: 0, max: 0 };
  }
}

export class ProjectModel {
  private static async getCollection(): Promise<Collection> {
    const db = await getDatabase();
    return db.collection('projects');
  }

  static async findById(id: string): Promise<Project | null> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ _id: new ObjectId(id) });
    return result as Project | null;
  }

  static async findAll(): Promise<Project[]> {
    const collection = await this.getCollection();
    const results = await collection.find({}).toArray();
    return results as Project[];
  }

  static async findByCity(city: string): Promise<Project[]> {
    const collection = await this.getCollection();
    const results = await collection.find({ 
      city: new RegExp(city, 'i') 
    }).toArray();
    return results as Project[];
  }

  static async findByStatus(status: 'completed' | 'under-construction' | 'off-plan'): Promise<Project[]> {
    const collection = await this.getCollection();
    const results = await collection.find({ constructionStatus: status }).toArray();
    return results as Project[];
  }

  static async create(project: Omit<Project, '_id'>): Promise<ObjectId> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(project);
    return result.insertedId;
  }

  static async update(id: string, updates: Partial<Project>): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async getStatistics(): Promise<any> {
    const collection = await this.getCollection();
    const results = await collection.aggregate([
      {
        $group: {
          _id: '$constructionStatus',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    return results;
  }
}

export class LeadModel {
  private static async getCollection(): Promise<Collection> {
    const db = await getDatabase();
    return db.collection('leads');
  }

  static async findById(id: string): Promise<ILead | null> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ _id: new ObjectId(id) });
    return result as ILead | null;
  }

  static async findAll(limit: number = 100): Promise<ILead[]> {
    const collection = await this.getCollection();
    const results = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    return results as ILead[];
  }

  static async findByStatus(status: 'new' | 'contacted' | 'qualified' | 'closed'): Promise<ILead[]> {
    const collection = await this.getCollection();
    const results = await collection
      .find({ status })
      .sort({ timestamp: -1 })
      .toArray();
    return results as ILead[];
  }

  static async findByPhone(phone: string): Promise<ILead[]> {
    const collection = await this.getCollection();
    const results = await collection
      .find({ phone })
      .sort({ timestamp: -1 })
      .toArray();
    return results as ILead[];
  }

  static async findRecent(days: number = 7): Promise<ILead[]> {
    const collection = await this.getCollection();
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const results = await collection
      .find({ timestamp: { $gte: date } })
      .sort({ timestamp: -1 })
      .toArray();
    return results as ILead[];
  }

  static async create(lead: Omit<ILead, '_id' | 'status' | 'timestamp'>): Promise<ObjectId> {
    const collection = await this.getCollection();
    const result = await collection.insertOne({
      ...lead,
      timestamp: new Date(),
      status: 'new'
    });
    return result.insertedId;
  }

  static async updateStatus(id: string, status: 'new' | 'contacted' | 'qualified' | 'closed'): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }



  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async getStatistics(): Promise<any> {
    const collection = await this.getCollection();
    
    const statusCounts = await collection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const languageCounts = await collection.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const total = await collection.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await collection.countDocuments({ 
      timestamp: { $gte: today } 
    });

    return {
      total,
      todayCount,
      byStatus: statusCounts,
      byLanguage: languageCounts
    };
  }
}

export class SessionModel {
  private static async getCollection(): Promise<Collection> {
    const db = await getDatabase();
    return db.collection('sessions');
  }

  static async findById(sessionId: string): Promise<Session | null> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ sessionId });
    return result as Session | null;
  }

  static async create(session: Omit<Session, '_id'>): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne({
      ...session,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static async update(sessionId: string, updates: Partial<Session>): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { sessionId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  static async addMessage(sessionId: string, message: any): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { sessionId },
      { 
        $push: { conversationHistory: message },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  }

  static async updatePreferences(sessionId: string, preferences: any): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { sessionId },
      { 
        $set: { 
          preferences,
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  static async markLeadCaptured(sessionId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { sessionId },
      { 
        $set: { 
          leadCaptured: true,
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  static async delete(sessionId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ sessionId });
    return result.deletedCount > 0;
  }

  static async deleteExpired(daysOld: number = 30): Promise<number> {
    const collection = await this.getCollection();
    const date = new Date();
    date.setDate(date.getDate() - daysOld);
    
    const result = await collection.deleteMany({
      updatedAt: { $lt: date }
    });
    return result.deletedCount;
  }

  static async getActiveCount(minutesActive: number = 30): Promise<number> {
    const collection = await this.getCollection();
    const date = new Date();
    date.setMinutes(date.getMinutes() - minutesActive);
    
    return collection.countDocuments({
      updatedAt: { $gte: date }
    });
  }
}

