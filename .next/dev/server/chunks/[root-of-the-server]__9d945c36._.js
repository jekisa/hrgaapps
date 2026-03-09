module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/lib/db.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}
let cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose;
if (!cached) {
    cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose = {
        conn: null,
        promise: null
    };
}
async function dbConnect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].connect(MONGODB_URI, {
            bufferCommands: false
        }).then((m)=>m);
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}
const __TURBOPACK__default__export__ = dbConnect;
}),
"[project]/models/User.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const userSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [
            'ADMIN',
            'STAFF'
        ],
        default: 'STAFF'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret)=>{
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.User || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('User', userSchema);
}),
"[project]/lib/auth.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authOptions",
    ()=>authOptions,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/User.js [app-route] (ecmascript)");
;
;
;
;
;
const authOptions = {
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: 'credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email'
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            async authorize (credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email dan password harus diisi');
                }
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
                    email: credentials.email
                });
                if (!user || !user.isActive) {
                    throw new Error('Email atau password salah');
                }
                const isPasswordValid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error('Email atau password salah');
                }
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            }
        })
    ],
    callbacks: {
        async jwt ({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session ({ session, token }) {
            if (token) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET
};
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(authOptions);
}),
"[project]/models/Karyawan.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const karyawanSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    nik: {
        type: String,
        required: true,
        unique: true
    },
    nama: {
        type: String,
        required: true
    },
    tempatLahir: {
        type: String,
        default: null
    },
    tanggalLahir: {
        type: Date,
        default: null
    },
    jenisKelamin: {
        type: String,
        default: null
    },
    agama: {
        type: String,
        default: null
    },
    alamat: {
        type: String,
        default: null
    },
    telepon: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    foto: {
        type: String,
        default: null
    },
    statusKontrak: {
        type: String,
        enum: [
            'PKWTT',
            'PKWT',
            'PROBATION'
        ],
        default: 'PKWTT'
    },
    tanggalMasuk: {
        type: Date,
        default: null
    },
    tanggalKontrakBerakhir: {
        type: Date,
        default: null
    },
    departemen: {
        type: String,
        default: null
    },
    jabatan: {
        type: String,
        default: null
    },
    statusAktif: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret)=>{
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Karyawan || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('Karyawan', karyawanSchema);
}),
"[project]/models/Aset.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const asetSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    kodeAset: {
        type: String,
        required: true,
        unique: true
    },
    namaAset: {
        type: String,
        required: true
    },
    kategori: {
        type: String,
        required: true
    },
    merk: {
        type: String,
        default: null
    },
    model: {
        type: String,
        default: null
    },
    serialNumber: {
        type: String,
        default: null
    },
    tahunPerolehan: {
        type: Number,
        default: null
    },
    nilaiPerolehan: {
        type: Number,
        default: null
    },
    kondisi: {
        type: String,
        enum: [
            'BAIK',
            'RUSAK_RINGAN',
            'RUSAK_BERAT',
            'DISPOSAL'
        ],
        default: 'BAIK'
    },
    status: {
        type: String,
        enum: [
            'AKTIF',
            'DIPINJAM',
            'RUSAK',
            'DISPOSAL'
        ],
        default: 'AKTIF'
    },
    lokasi: {
        type: String,
        default: null
    },
    keterangan: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret)=>{
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Aset || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('Aset', asetSchema);
}),
"[project]/models/MaintenanceRequest.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const maintenanceRequestSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    judul: {
        type: String,
        required: true
    },
    lokasi: {
        type: String,
        default: null
    },
    kategori: {
        type: String,
        default: null
    },
    deskripsi: {
        type: String,
        default: null
    },
    prioritas: {
        type: String,
        enum: [
            'LOW',
            'NORMAL',
            'HIGH',
            'URGENT'
        ],
        default: 'NORMAL'
    },
    status: {
        type: String,
        enum: [
            'PENDING',
            'PROSES',
            'SELESAI',
            'DITOLAK'
        ],
        default: 'PENDING'
    },
    pemohon: {
        type: String,
        default: null
    },
    pelaksana: {
        type: String,
        default: null
    },
    biaya: {
        type: Number,
        default: null
    },
    tanggalRequest: {
        type: Date,
        default: Date.now
    },
    tanggalSelesai: {
        type: Date,
        default: null
    },
    keterangan: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret)=>{
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.MaintenanceRequest || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('MaintenanceRequest', maintenanceRequestSchema);
}),
"[project]/models/Kendaraan.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const kendaraanSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    noPol: {
        type: String,
        required: true,
        unique: true
    },
    merk: {
        type: String,
        required: true
    },
    model: {
        type: String,
        default: null
    },
    tahun: {
        type: Number,
        default: null
    },
    warna: {
        type: String,
        default: null
    },
    jenisKendaraan: {
        type: String,
        default: null
    },
    noRangka: {
        type: String,
        default: null
    },
    noMesin: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: [
            'TERSEDIA',
            'DIGUNAKAN',
            'SERVIS',
            'TIDAK_AKTIF'
        ],
        default: 'TERSEDIA'
    },
    tanggalPajakBerakhir: {
        type: Date,
        default: null
    },
    tanggalSTNKBerakhir: {
        type: Date,
        default: null
    },
    keterangan: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret)=>{
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Kendaraan || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('Kendaraan', kendaraanSchema);
}),
"[project]/models/PembayaranPajak.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const pembayaranPajakSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    kendaraanId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema.Types.ObjectId,
        ref: 'Kendaraan',
        required: true
    },
    jenisPajak: {
        type: String,
        enum: [
            'PKB',
            'STNK',
            'SWDKLLJ',
            'LAINNYA'
        ],
        default: 'PKB'
    },
    tahun: {
        type: Number,
        default: null
    },
    tanggalJatuhTempo: {
        type: Date,
        default: null
    },
    tanggalBayar: {
        type: Date,
        default: null
    },
    jumlah: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: [
            'BELUM',
            'SUDAH'
        ],
        default: 'BELUM'
    },
    keterangan: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret)=>{
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.PembayaranPajak || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('PembayaranPajak', pembayaranPajakSchema);
}),
"[project]/models/Notifikasi.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const notifikasiSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    judul: {
        type: String,
        required: true
    },
    pesan: {
        type: String,
        default: null
    },
    tipe: {
        type: String,
        default: null
    },
    targetId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema.Types.ObjectId,
        default: null
    },
    status: {
        type: String,
        enum: [
            'BELUM_DIBACA',
            'SUDAH_DIBACA'
        ],
        default: 'BELUM_DIBACA'
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret)=>{
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Notifikasi || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('Notifikasi', notifikasiSchema);
}),
"[project]/models/AuditLog.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const auditLogSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    userId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    aksi: {
        type: String,
        required: true
    },
    modul: {
        type: String,
        required: true
    },
    detail: {
        type: String,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret)=>{
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.AuditLog || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('AuditLog', auditLogSchema);
}),
"[project]/models/Utilitas.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const utilitasSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    jenis: {
        type: String,
        enum: [
            'LISTRIK',
            'AIR',
            'INTERNET',
            'LAINNYA'
        ],
        required: true
    },
    bulan: {
        type: Number,
        required: true
    },
    tahun: {
        type: Number,
        required: true
    },
    tagihan: {
        type: Number,
        default: null
    },
    penggunaan: {
        type: Number,
        default: null
    },
    satuan: {
        type: String,
        default: null
    },
    statusBayar: {
        type: String,
        enum: [
            'BELUM',
            'SUDAH'
        ],
        default: 'BELUM'
    },
    tanggalBayar: {
        type: Date,
        default: null
    },
    keterangan: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret)=>{
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Utilitas || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('Utilitas', utilitasSchema);
}),
"[project]/app/api/dashboard/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Karyawan$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Karyawan.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Aset$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Aset.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$MaintenanceRequest$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/MaintenanceRequest.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Kendaraan$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Kendaraan.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$PembayaranPajak$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/PembayaranPajak.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Notifikasi$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Notifikasi.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$AuditLog$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/AuditLog.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Utilitas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Utilitas.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$addDays$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/addDays.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfMonth$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/endOfMonth.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$subMonths$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/subMonths.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
async function GET() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'Unauthorized'
    }, {
        status: 401
    });
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const now = new Date();
        const thirtyDaysLater = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$addDays$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addDays"])(now, 30);
        const [totalKaryawan, karyawanAktif, kontrakBerakhir, totalAset, asetDipinjam, maintenancePending, totalKendaraan, kendaraanTersedia, pajakJatuhTempo, notifikasiUnread, recentAudit, asetByKategoriRaw, monthlyUtilitasRaw, karyawanByKontrakRaw] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Karyawan$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Karyawan$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
                statusAktif: true
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Karyawan$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
                tanggalKontrakBerakhir: {
                    $gte: now,
                    $lte: thirtyDaysLater
                },
                statusAktif: true
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Aset$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Aset$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
                status: 'DIPINJAM'
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$MaintenanceRequest$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
                status: {
                    $in: [
                        'PENDING',
                        'PROSES'
                    ]
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Kendaraan$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Kendaraan$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
                status: 'TERSEDIA'
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$PembayaranPajak$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
                status: 'BELUM',
                tanggalJatuhTempo: {
                    $gte: now,
                    $lte: thirtyDaysLater
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Notifikasi$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
                status: 'BELUM_DIBACA'
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$AuditLog$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find().sort({
                createdAt: -1
            }).limit(5).populate('userId', 'name'),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Aset$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
                {
                    $group: {
                        _id: '$kategori',
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Utilitas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
                {
                    $match: {
                        bulan: now.getMonth() + 1,
                        tahun: now.getFullYear()
                    }
                },
                {
                    $group: {
                        _id: '$jenis',
                        total: {
                            $sum: '$tagihan'
                        }
                    }
                }
            ]),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Karyawan$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
                {
                    $match: {
                        statusAktif: true
                    }
                },
                {
                    $group: {
                        _id: '$statusKontrak',
                        count: {
                            $sum: 1
                        }
                    }
                }
            ])
        ]);
        // Monthly karyawan trend (last 6 months)
        const monthlyKaryawan = [];
        for(let i = 5; i >= 0; i--){
            const date = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$subMonths$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["subMonths"])(now, i);
            const count = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Karyawan$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
                tanggalMasuk: {
                    $lte: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfMonth$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["endOfMonth"])(date)
                }
            });
            monthlyKaryawan.push({
                month: date.toLocaleString('id-ID', {
                    month: 'short'
                }),
                total: count
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            stats: {
                totalKaryawan,
                karyawanAktif,
                kontrakBerakhir,
                totalAset,
                asetDipinjam,
                maintenancePending,
                totalKendaraan,
                kendaraanTersedia,
                pajakJatuhTempo,
                notifikasiUnread
            },
            charts: {
                karyawanByKontrak: karyawanByKontrakRaw.map((k)=>({
                        name: k._id,
                        value: k.count
                    })),
                asetByKategori: asetByKategoriRaw.map((a)=>({
                        name: a._id,
                        value: a.count
                    })),
                monthlyKaryawan,
                monthlyUtilitas: monthlyUtilitasRaw.map((u)=>({
                        name: u._id,
                        tagihan: u.total || 0
                    }))
            },
            recentActivity: recentAudit.map((log)=>{
                const obj = log.toJSON();
                return {
                    id: obj.id,
                    user: obj.userId?.name || 'System',
                    aksi: obj.aksi,
                    modul: obj.modul,
                    detail: obj.detail,
                    createdAt: obj.createdAt
                };
            })
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Gagal memuat data dashboard'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9d945c36._.js.map