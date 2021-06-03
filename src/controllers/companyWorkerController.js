const nodemailer=require('nodemailer')
const jwt = require('jsonwebtoken');
//const ContractorWorker=require('../model/contractorWorker');
const Unavailability=require('../model/unavailabilityContractor');
//const bcrypt = require('bcrypt');
const { CompanyWorker, validate,validateEditCompanyWorker } = require('../model/companyWorker');
const {Employement, validateEmployement} = require('../model/employement');
const { ContractorWorker, validateContractor,validateEditContractoWorker } = require('../model/contractorWorker');

const { Employer, validate2,validateEditEmployer } = require('../model/employer');

//const {Employement,validateEmployement}=require('../model/employement');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

//הוספת עובדי משאבי אנוש
const addCompanyWorker = (req,res) => {
    if (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(req.body.mail).toLowerCase())) {
        if (companyExists(req.body.mail) == false) {
            console.log(req.body);
            const newComapnyWorker = new CompanyWorker(req.body)
                newComapnyWorker.save().then(companyWorker => {
                    res.send('success to add db')
                    console.log('succ');
                }).catch(err => {
                    console.log(`can not add this worker! ${err}`);
                })
        }
        else {
            console.log('exists!!');
        }
    }
    else {
        console.log('not valid!!');
    }
}

const companyExists = (mail) => {
    CompanyWorker.findOne({ mail:mail }).then(CompanyWorker=> {
        console.log('exists');
        return true;
    }).catch(err=> {
        console.log(`not exists!! ${err}`);
        return false;
    })
    return false;
}
//מחיקת עובד משאבי אנוש
const deleteCompanyWorkerById = (req,res) => {
    CompanyWorker.findByIdAndDelete(req.params.id).then(CompanyWorker=> {
        res.send('success to dalete')
    }).catch(err => {
        console.log(`can not delete this worker! ${err}`);
    })
}
//עובד חברה לפי מייל
const getCompanyWorkerByEmail = async(mail) => {

    let companyWorker = await CompanyWorker.findOne({mail:req.params.mail})
    if (companyWorker) {
        res.render('../views/companyWorkerEditProfile',{companyWorker})
    }
    else {
        return res.status(400).send('That mail is error!');
    }
}
//סיסמא
const resetPassword = async (req, res) => {
    const { mail } = req.body.mail
    const name = req.body.firstName
    let randomstring = Math.random().toString(36).slice(-8)
    const salt = await bcrypt.genSalt(10);
    let password = await bcrypt.hash(randomstring, salt);
    let companyWorker = await CompanyWorker.findOne({ mail: req.body.mail }).then(companyWorker=>{
        companyWorker.password=password
        companyWorker.markModified('password')
        companyWorker.save(err => console.log(err))
    })

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ravitlevi999@gmail.com',
            pass: 'ravit99clark'
        }
    })

    let mailOptions = {
        from: 'ravitlevi999@gmail.com',
        to: email,
        subject: 'password reset',
        text: `Hello ${name},\nYour password has been reset and your password is now is:  ${randomstring}\n,Sincerely, The Site Staff`
    }
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}
//הצגת פרופיל
const editProfileDisplay = async (req, res) => {
    let companyWorker = await CompanyWorker.findOne({mail:req.params.mail})
    if (companyWorker) {
        res.render('../views/companyWorkerEditProfile',{companyWorker:companyWorker});
    }
    else {
        return res.status(400).send('That email is error!');
    }
}
//עריכת פרופיל
const editProfile = async (req, res) => {
    let companyWorker = await CompanyWorker.findOneAndUpdate({mail: req.params.mail}, req.body, {new: true });
    res.redirect(`/companyWorker/homePage/${req.params.mail}`);
    console.log('infoCompanyWorker1/1');
    infoCompanyWorker();
    console.log('infoCompanyWorker1/2');

}

const updateCompanyWorkerPass = (req,res) => {
    console.log(`in update pass`);
    CompanyWorker.findOneAndUpdate({mail: req.params.mail}, {password: req.body.password})
        .then(companyWorker => {
            console.log(req.body.password);
            console.log(req.body.mail);
            res.redirect(`/companyWorker/homePage/${req.params.mail}`);
        }).catch(err => {
        console.log(`can not update this paa! ${err}`);
    })

}
//  פונקציה שמחזירה עובדים שעומדים בסינונים ופנויים בתאריך
const searchContractorByFields = async(req, res) => {
   // const avilableConsArr = await ContractorAvialableDate(req.body.employmentDate);
    var result;
    var filteredCons = [];
    if(req.body.service == 'select') {
        if(req.body.scope == 'select') {
            if(req.body.experience == 'select') {
                try {
                    filteredCons = await ContractorWorker.find( {occupationArea: req.body.occupation})
                    result = await availableCons(filteredCons);
                    res.render('../views/companyWorkerSearchResult', {result:result});
                }
                catch(err) {
                    console.log(err);
                }
            }
            else {
                try {
                    filteredCons = await ContractorWorker.find( {occupationArea:req.body.occupation, experienceField:req.body.experience})
                    result = await availableCons(filteredCons);
                    res.render('../views/companyWorkerSearchResult', {result:result});
                }
                catch(err) {
                    console.log(err);
                }
            }
        }
        else {
            if(req.body.experience == 'select') {
                try {
                    filteredCons = await ContractorWorker.find( {occupationArea:req.body.occupation, scopeWork:req.body.scope})
                    console.log(filteredCons);
                    result = await availableCons(filteredCons);
                    res.render('../views/companyWorkerSearchResult', {result:result});
                }
                catch(err) {
                    console.log(err);
                }
            }
            else {
                try {
                    filteredCons = await ContractorWorker.find( {occupationArea:req.body.occupation, scopeWork:req.body.scope, experienceField:req.body.experience})
                    result = await availableCons(filteredCons);
                    res.render('../views/companyWorkerSearchResult', {result:result});
                }
                catch(err) {
                    console.log(err);
                }
            }
        }
    }
    else {
        if(req.body.scope == 'select') {
            if(req.body.experience == 'select') {
                try {
                    filteredCons = await ContractorWorker.find( {occupationArea:req.body.occupation ,serviceArea:req.body.service})
                    result = await availableCons(filteredCons);
                    res.render('../views/companyWorkerSearchResult', {result:result});
                }
                catch(err) {
                    console.log(err);
                }
            }
            else {
                try {
                    filteredCons = await ContractorWorker.find( {occupationArea:req.body.occupation, serviceArea:req.body.service, experienceField:req.body.experience})
                    result = await availableCons(filteredCons);
                    res.render('../views/companyWorkerSearchResult', {result:result});
                }
                catch(err) {
                    console.log(err);
                }
            }
        }
        else {
            if(req.body.experience == 'select') {
                try {
                    filteredCons = await ContractorWorker.find( {occupationArea:req.body.occupation, serviceArea:req.body.service, scopeWork:req.body.scope})
                    result = await availableCons(filteredCons);
                    res.render('../views/companyWorkerSearchResult',{result:result});
                }
                catch(err) {
                    console.log(err);
                }
            }
            else {
                try {
                    filteredCons = await ContractorWorker.find( {occupationArea:req.body.occupation, serviceArea:req.body.service, scopeWork:req.body.scope, experienceField:req.body.experience})
                    result = await availableCons(filteredCons);
                    res.render('../views/companyWorkerHomePage', {result:result});
                }
                catch(err) {
                    console.log(err);
                }
            }
        }
    }
}

const bookContractorDisplay = async (req, res) => {
    let contractor = await ContractorWorker.findById(req.params.idConstractor)
    let employer = await Employer.find()
    /*if (!contractor || !employer) {
        return res.status(400).send('That error in system');
    }*/

    res.render('../views/bookContractor', {contractor: contractor, date: req.params.date, companyName: employer.companyName});

}
const bookContractor = async (req, res) => {
    let contractor = await ContractorWorker.findById(req.params.idConstractor)
    //let employer = await Employer.findOne({email: req.params.emailEmployer})
    /*if (!contractor || !employer) {
        return res.status(400).send('That error in system');
    }*/

        let employement = new Employement({ constructorEmail: contractor.mail, date: req.params.date, jobScope: req.body.numBusinessHours, status: 'waiting for approval',hourlyWage: contractor.hourlyWage, rating: 0, feedback:'',occupationArea: contractor.occupationArea});
        await employement.save();
        // console.log({id: contractor.unavailability,date:req.params.date})
        ContractorWorkeController.addDateToUnavailabilityarray(contractor.unavailability, req.params.date,req.params.date);
        res.redirect(`/companyWorker/homePage/${req.params.mail}`);

}

// פונקציה שמציבה במערך את המייל ומספר ההעסקות של כל מעסיק
const infoCompanyWorker = async() => {
    try {
        console.log('infoCompanyWorker');
        var arrMail = [];
        var arrNum = [];
        var i = 0;
        var j = 0;
        //const d = new Date(date)
        //const myDate = new Date(d.getFullYear(), d.getMonth(), d.getUTCDate() + 1)
        let employers = await Employer.find();
        //console.log(employers[0].email);
        //console.log(employers.length);
        for (i = 0; i < employers.length; i++) {
            arrMail[i] = employers[i].email;
            let employements = await Employement.find();
            arrNum[i]=0;
            for (j = 0; j < employements.length; j++) {
                //console.log(array[i]);
                if (arrMail[i] == employements[j].employerEmail) {
                    arrNum[i] = arrNum[i]+1;
                    //console.log(array2[i]);
                }
            }
        }
        res.render('../views/companyWorkerMenuEmployers', {arrMail:arrMail,arrNum:arrNum});
    }
    catch(err) {
        console.log(err);
    }
    console.log('infoCompanyWorker2');
    //console.log(array[0]);
}

const allEmployer = async (req,res) => {
    try {
        console.log(req.params.mail);
        let fEmployment = await Employer.find();
        res.render('../views/companyWorkerMenuEmployers', {fEmployment:fEmployment,mailCompany:req.params.mail });
    }
    catch(err) {
        console.log(err);
    }
}
const allCompany = async (req,res) => {
    try {
        console.log(req.params.mail);
        let fEmployment = await ContractorWorker.find();
        res.render('../views/companyWorkerMenuContractor', {fEmployment:fEmployment,mailCompany:req.params.mail });
    }
    catch(err) {
        console.log(err);
    }
}



module.exports={addCompanyWorker,companyExists,deleteCompanyWorkerById,getCompanyWorkerByEmail,resetPassword,editProfileDisplay,editProfile,updateCompanyWorkerPass,searchContractorByFields,bookContractor,bookContractorDisplay,allEmployer,allCompany}