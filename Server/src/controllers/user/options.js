// src/controllers/user/options.js
// Returns configuration options for dropdowns

/**
 * Get all dropdown options for the registration form
 * These values match the enums defined in the models
 */
exports.getOptions = async (req, res) => {
    try {
        const options = {
            // Group types - from Group model enum
            groupTypes: [
                { value: 'classroom', labelEn: 'Classroom', labelAr: 'فصل دراسي' },
                { value: 'group', labelEn: 'Group', labelAr: 'مجموعة' },
                { value: 'private', labelEn: 'Private', labelAr: 'خاص' }
            ],
            
            // Group levels (for future use)
            groupLevels: [
                { value: 'beginner', labelEn: 'Beginner', labelAr: 'مبتدئ' },
                { value: 'intermediate', labelEn: 'Intermediate', labelAr: 'متوسط' },
                { value: 'advanced', labelEn: 'Advanced', labelAr: 'متقدم' }
            ],
            
            // Education types - from Student model enum
            educationTypes: [
                { value: 'local', labelEn: 'Local', labelAr: 'محلي' },
                { value: 'azhar', labelEn: 'Azhar', labelAr: 'أزهري' },
                { value: 'national', labelEn: 'National', labelAr: 'وطني' },
                { value: 'international', labelEn: 'International', labelAr: 'دولي' }
            ],
            
            // Grades - from Student model enum
            grades: [
                { value: 'KG1', labelEn: 'KG 1', labelAr: 'تمهيدي 1' },
                { value: 'KG2', labelEn: 'KG 2', labelAr: 'تمهيدي 2' },
                { value: 'G1', labelEn: 'Grade 1', labelAr: 'الصف الأول' },
                { value: 'G2', labelEn: 'Grade 2', labelAr: 'الصف الثاني' },
                { value: 'G3', labelEn: 'Grade 3', labelAr: 'الصف الثالث' },
                { value: 'G4', labelEn: 'Grade 4', labelAr: 'الصف الرابع' },
                { value: 'G5', labelEn: 'Grade 5', labelAr: 'الصف الخامس' },
                { value: 'G6', labelEn: 'Grade 6', labelAr: 'الصف السادس' },
                { value: 'G7', labelEn: 'Grade 7', labelAr: 'الصف السابع' },
                { value: 'G8', labelEn: 'Grade 8', labelAr: 'الصف الثامن' },
                { value: 'G9', labelEn: 'Grade 9', labelAr: 'الصف التاسع' },
                { value: 'G10', labelEn: 'Grade 10', labelAr: 'الصف العاشر' },
                { value: 'G11', labelEn: 'Grade 11', labelAr: 'الصف الحادي عشر' },
                { value: 'G12', labelEn: 'Grade 12', labelAr: 'الصف الثاني عشر' }
            ]
        };

        res.status(200).json(options);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
