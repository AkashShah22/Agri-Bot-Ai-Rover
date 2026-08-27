const express=require('express');
const router=express.Router();
const db=require('../config/database.js');

router.get('/records',(req,res)=>{
    try{
        const rows=db.prepare('Select * from observations order by id desc limit 50').all();
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Telemetry error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});
module.exports=router;
