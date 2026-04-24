import mongoose from 'mongoose';

export const connectDB = async () => {
   await mongoose.connect("mongodb+srv://deekshayadav20045_db_user:test123@cluster0.ogm4wph.mongodb.net/MediCare")
    .then(() => {
        console.log("DB CONNECTED");
    })
}