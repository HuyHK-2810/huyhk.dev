"use client"
import Container from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { Check, X, Star, Zap, Shield, Rocket, Crown, Sparkles, Settings, Wrench } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

interface PricingPackage {
    id: string
    name: string
    price: string
    basePrice: number
    originalPrice?: string
    period: string
    description: string
    icon: React.ReactNode
    popular?: boolean
    features: string[]
    notIncluded?: string[]
    timeline: string
    deliverables: string[]
    techStack: string[]
    support: string
    revisions: string
    hosting: string
    maintenance: string
    gradient: string
}

interface DesignOption {
    id: string
    name: string
    priceMultiplier: number
    description: string
    icon: React.ReactNode
}

interface AdditionalFeature {
    id: string
    name: string
    price: number
    description: string
    icon: React.ReactNode
}

interface ContactForm {
    name: string
    email: string
    phone: string
    company: string
    message: string
}

const XNKMinhPhucPricingContent = () => {
    const [selectedPackage, setSelectedPackage] = useState<PricingPackage | null>(null)
    const [selectedDesign, setSelectedDesign] = useState<string>('template-existing')
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [contractType, setContractType] = useState<string>('freelancer')
    const [finalPrice, setFinalPrice] = useState<number>(0)
    const [showContactForm, setShowContactForm] = useState<boolean>(false)
    const [contactForm, setContactForm] = useState<ContactForm>({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    })

    const packages: PricingPackage[] = [
        {
            id: 'starter',
            name: 'Website Cơ Bản',
            price: 'Từ 7.5tr',
            basePrice: 7.5,
            originalPrice: '10tr',
            period: 'một lần',
            description: 'Website giới thiệu công ty và sản phẩm cơ khí cơ bản',
            icon: <Wrench className="w-6 h-6" />,
            gradient: 'from-blue-500 to-cyan-500',
            features: [
                'Trang chủ với slider sản phẩm',
                'Giới thiệu công ty',
                'Catalog sản phẩm cơ khí (20-30 sản phẩm)',
                'Trang dự án đã thực hiện',
                'Form liên hệ & báo giá',
                'Tích hợp bản đồ Google Maps',
                'Responsive trên mọi thiết bị',
                'SEO cơ bản cho ngành cơ khí'
            ],
            notIncluded: [
                'Hệ thống quản lý nội dung',
                'Tính năng thương mại điện tử',
                'Phân tích nâng cao'
            ],
            timeline: '1-2 tuần',
            deliverables: [
                'Website responsive hoàn chỉnh',
                'Source code & tài nguyên',
                'Tối ưu SEO cơ bản',
                'Cài đặt Google Analytics',
                'Tích hợp form liên hệ'
            ],
            techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
            support: '1 tháng hỗ trợ miễn phí',
            revisions: '3 lần chỉnh sửa',
            hosting: 'Hỗ trợ triển khai',
            maintenance: 'Hướng dẫn bảo trì cơ bản'
        },
        {
            id: 'professional',
            name: 'Website Chuyên Nghiệp',
            price: 'Từ 13.5tr',
            basePrice: 13.5,
            originalPrice: '18tr',
            period: 'một lần',
            description: 'Website đầy đủ tính năng cho doanh nghiệp cơ khí phát triển',
            icon: <Settings className="w-6 h-6" />,
            popular: true,
            gradient: 'from-purple-500 to-pink-500',
            features: [
                'Tất cả tính năng gói cơ bản',
                'Hệ thống quản lý sản phẩm nâng cao',
                'Catalog sản phẩm không giới hạn',
                'Hệ thống tin tức & blog kỹ thuật',
                'Trang tuyển dụng',
                'Hệ thống báo giá online',
                'Tích hợp CRM cơ bản',
                'Analytics & tracking chuyên sâu'
            ],
            notIncluded: [
                'Tính năng thương mại điện tử',
                'Tích hợp tùy chỉnh',
                'Quản lý người dùng nâng cao'
            ],
            timeline: '2-3 tuần',
            deliverables: [
                'Website với CMS',
                'Dashboard quản trị',
                'Công cụ tạo nội dung',
                'Tối ưu SEO',
                'Theo dõi hiệu suất',
                'Tích hợp phân tích'
            ],
            techStack: ['Next.js', 'React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
            support: '3 tháng hỗ trợ miễn phí',
            revisions: '5 lần chỉnh sửa',
            hosting: 'Cài đặt hosting miễn phí',
            maintenance: '3 tháng bảo trì bao gồm'
        },
        {
            id: 'enterprise',
            name: 'Website Doanh Nghiệp',
            price: 'Từ 37.5tr',
            basePrice: 37.5,
            originalPrice: '50tr',
            period: 'một lần',
            description: 'Giải pháp website tích hợp ERP cho doanh nghiệp cơ khí lớn',
            icon: <Crown className="w-6 h-6" />,
            gradient: 'from-orange-500 to-red-500',
            features: [
                'Tất cả tính năng gói chuyên nghiệp',
                'Tích hợp hệ thống ERP',
                'Quản lý kho hàng tự động',
                'Hệ thống đặt hàng B2B',
                'Portal khách hàng riêng',
                'Báo cáo kinh doanh thông minh',
                'Tích hợp với phần mềm kế toán',
                'API cho mobile app'
            ],
            timeline: '4-6 tuần',
            deliverables: [
                'Ứng dụng web full-stack',
                'Nền tảng thương mại điện tử',
                'Hệ thống quản lý người dùng',
                'API endpoints tùy chỉnh',
                'Phân tích nâng cao',
                'Hỗ trợ đa ngôn ngữ',
                'Tích hợp thanh toán'
            ],
            techStack: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe API'],
            support: '6 tháng hỗ trợ cao cấp',
            revisions: 'Chỉnh sửa không giới hạn',
            hosting: 'Hosting cao cấp bao gồm',
            maintenance: '6 tháng bảo trì đầy đủ'
        },
        {
            id: 'custom',
            name: 'Giải Pháp Tùy Chỉnh',
            price: 'Thỏa thuận',
            basePrice: 0,
            period: 'theo yêu cầu',
            description: 'Giải pháp số hóa toàn diện cho tập đoàn cơ khí',
            icon: <Sparkles className="w-6 h-6" />,
            gradient: 'from-emerald-500 to-teal-500',
            features: [
                'Phân tích yêu cầu chi tiết',
                'Thiết kế kiến trúc hệ thống',
                'Tích hợp với hệ thống hiện tại',
                'AI/ML cho dự đoán nhu cầu',
                'IoT integration cho máy móc',
                'Blockchain cho truy xuất nguồn gốc',
                'Big Data analytics'
            ],
            timeline: 'Tùy theo dự án',
            deliverables: [
                'Ứng dụng web tùy chỉnh',
                'Tài liệu kỹ thuật',
                'Chiến lược triển khai',
                'Triển khai bảo mật',
                'Tối ưu hiệu suất',
                'Phiên đào tạo nhóm'
            ],
            techStack: ['Công nghệ dựa trên yêu cầu'],
            support: 'Hỗ trợ liên tục có sẵn',
            revisions: 'Chính sách chỉnh sửa linh hoạt',
            hosting: 'Giải pháp hosting tùy chỉnh',
            maintenance: 'Kế hoạch bảo trì được thiết kế riêng'
        }
    ]

    const designOptions: DesignOption[] = [
        {
            id: 'template-existing',
            name: 'Giống Trang Web Có Sẵn',
            priceMultiplier: 0.0,
            description: 'Copy 80-90% design từ trang web mẫu có sẵn',
            icon: <Star className="w-5 h-5" />
        },
        {
            id: 'template-company',
            name: 'Template Công Ty',
            priceMultiplier: 0.2,
            description: 'Chọn template có sẵn và customize theo yêu cầu',
            icon: <Settings className="w-5 h-5" />
        },
        {
            id: 'analysis-design',
            name: 'Phân Tích & Thiết Kế',
            priceMultiplier: 0.8,
            description: 'Phân tích website mẫu và thiết kế lại theo brand',
            icon: <Rocket className="w-5 h-5" />
        },
        {
            id: 'custom-design',
            name: 'Có Design Sẵn',
            priceMultiplier: 0.1,
            description: 'Khách hàng đã có design, chỉ cần lập trình',
            icon: <Wrench className="w-5 h-5" />
        }
    ]

    const additionalFeatures: AdditionalFeature[] = [
        {
            id: 'multilang',
            name: 'Đa Ngôn Ngữ',
            price: 6,
            description: 'Hỗ trợ 2-3 ngôn ngữ (Việt, Anh, Trung)',
            icon: <Star className="w-5 h-5" />
        },
        {
            id: 'ecommerce',
            name: 'Hệ Thống Đặt Hàng',
            price: 9,
            description: 'B2B ordering system với báo giá tự động',
            icon: <Crown className="w-5 h-5" />
        },
        {
            id: 'crm',
            name: 'CRM Integration',
            price: 7.5,
            description: 'Tích hợp với HubSpot, Salesforce hoặc custom CRM',
            icon: <Shield className="w-5 h-5" />
        },
        {
            id: 'training',
            name: 'Đào Tạo Team',
            price: 2.25,
            description: 'Training sử dụng CMS và quản lý website',
            icon: <Settings className="w-5 h-5" />
        },
        {
            id: 'mobile-app',
            name: 'Mobile App',
            price: 18.75,
            description: 'Ứng dụng di động iOS/Android cho khách hàng',
            icon: <Sparkles className="w-5 h-5" />
        }
    ]

    const calculateFinalPrice = (basePrice: number, designOption: string, selectedFeatures: string[], contractType: string) => {
        if (basePrice === 0) return 0 // Custom package

        const designMultiplier = designOptions.find(d => d.id === designOption)?.priceMultiplier || 0.0
        const designPrice = basePrice + (basePrice * designMultiplier)

        const additionalCost = selectedFeatures.reduce((total, featureId) => {
            const feature = additionalFeatures.find(f => f.id === featureId)
            return total + (feature?.price || 0)
        }, 0)

        const subtotal = designPrice + additionalCost
        const vatRate = contractType === 'company' ? 0.1 : 0
        const finalPrice = subtotal * (1 + vatRate)

        return Math.round(finalPrice * 100) / 100
    }

    const handleFeatureToggle = (featureId: string) => {
        setSelectedFeatures(prev => {
            const newFeatures = prev.includes(featureId)
                ? prev.filter(id => id !== featureId)
                : [...prev, featureId]

            if (selectedPackage) {
                setFinalPrice(calculateFinalPrice(selectedPackage.basePrice, selectedDesign, newFeatures, contractType))
            }
            return newFeatures
        })
    }

    const handleDesignChange = (designId: string) => {
        setSelectedDesign(designId)
        if (selectedPackage) {
            setFinalPrice(calculateFinalPrice(selectedPackage.basePrice, designId, selectedFeatures, contractType))
        }
    }

    const handleContractChange = (contractType: string) => {
        setContractType(contractType)
        if (selectedPackage) {
            setFinalPrice(calculateFinalPrice(selectedPackage.basePrice, selectedDesign, selectedFeatures, contractType))
        }
    }

    const openPackageModal = (pkg: PricingPackage) => {
        setSelectedPackage(pkg)
        setSelectedDesign('template-existing')
        setSelectedFeatures([])
        setContractType('freelancer')
        setFinalPrice(calculateFinalPrice(pkg.basePrice, 'template-existing', [], 'freelancer'))
    }

    const handleOrderClick = () => {
        if (selectedPackage?.basePrice === 0) {
            // Custom package - go directly to contact
            window.location.href = '/contact'
        } else {
            setShowContactForm(true)
        }
    }

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // FormSubmit sẽ tự động gửi email với dữ liệu form
        // Không cần xử lý thêm gì ở đây

        setShowContactForm(false)
        setSelectedPackage(null)
    }

    const addOns = [
        {
            name: 'Trang bổ sung',
            price: '1-2tr',
            description: 'Trang bổ sung với thiết kế tùy chỉnh',
            icon: <Wrench className="w-5 h-5" />
        },
        {
            name: 'Cài đặt E-commerce',
            price: '8-12tr',
            description: 'Cửa hàng trực tuyến với tích hợp thanh toán',
            icon: <Settings className="w-5 h-5" />
        },
        {
            name: 'Tối ưu SEO',
            price: '5-8tr',
            description: 'SEO nâng cao và tăng tốc hiệu suất',
            icon: <Rocket className="w-5 h-5" />
        },
        {
            name: 'Gói bảo trì',
            price: '2-3tr/tháng',
            description: 'Cập nhật hàng tháng và vá bảo mật',
            icon: <Shield className="w-5 h-5" />
        }
    ]

    return (
        <section className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20"></div>
            <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <Container className="relative z-10">
                <div className="py-20 flex flex-col gap-20">

                    {/* Enhanced Header */}
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="font-bold text-5xl mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200 lg:text-6xl">
                            Báo Giá Đặc Biệt - XNK Minh Phúc
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            Giảm giá 25% cho tất cả gói website cơ khí. Chuyên nghiệp, hiện đại,
                            tối ưu cho ngành công nghiệp và thiết bị cơ khí.
                        </p>

                        <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/25">
                            <Star className="w-6 h-6 fill-current" />
                            <span className="font-bold text-lg">Giảm giá 25% - Chỉ dành cho XNK Minh Phúc</span>
                        </div>
                    </div>

                    {/* Enhanced Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className={clsx(
                                'group relative rounded-3xl p-8 transition-all duration-500 cursor-pointer',
                                'hover:scale-105 hover:shadow-2xl',
                                'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl',
                                'dark:bg-slate-900/80 dark:border-slate-700/20',
                                pkg.popular && 'ring-2 ring-purple-500 ring-offset-4 ring-offset-transparent'
                            )}>
                                {pkg.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                            🔥 Phổ Biến Nhất
                                        </div>
                                    </div>
                                )}

                                {/* Icon & Title */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={clsx(
                                        'p-4 rounded-2xl bg-gradient-to-br shadow-lg text-white',
                                        pkg.gradient
                                    )}>
                                        {pkg.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {pkg.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        {pkg.originalPrice && (
                                            <span className="text-lg text-slate-400 line-through">
                                                {pkg.originalPrice}
                                            </span>
                                        )}
                                        {pkg.originalPrice && (
                                            <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                                                Giảm giá
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className={clsx(
                                            'text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
                                            pkg.gradient
                                        )}>
                                            {pkg.price}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {pkg.period}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    {pkg.description}
                                </p>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {pkg.features.slice(0, 5).map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mt-0.5">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                    {pkg.features.length > 5 && (
                                        <li className="text-slate-500 text-sm font-medium">
                                            +{pkg.features.length - 5} tính năng khác...
                                        </li>
                                    )}
                                </ul>

                                {/* CTA Button */}
                                <Button
                                    onClick={() => openPackageModal(pkg)}
                                    className={clsx(
                                        'w-full h-12 rounded-xl font-semibold transition-all duration-300',
                                        'bg-gradient-to-r text-white shadow-lg hover:shadow-xl group-hover:scale-105',
                                        pkg.gradient
                                    )}
                                >
                                    {pkg.id === 'custom' ? 'Nhận Báo Giá' : 'Tùy Chỉnh & Báo Giá'}
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Add-ons */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
                        <div className="relative bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 rounded-3xl p-10 border border-white/20 dark:border-slate-700/20">
                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                    Dịch Vụ Bổ Sung
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Nâng cao dự án của bạn với những tính năng tùy chọn này
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {addOns.map((addon, index) => (
                                    <div key={index} className="group bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 rounded-2xl p-6 border border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                                {addon.icon}
                                            </div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                                {addon.name}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {addon.price}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                            {addon.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced CTA Section */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-10"></div>
                        <div className="relative text-center bg-white/30 backdrop-blur-sm dark:bg-slate-900/30 rounded-3xl p-12 border border-white/20 dark:border-slate-700/20">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6">
                                <Rocket className="w-5 h-5" />
                                <span className="font-semibold">Sẵn Sàng Bắt Đầu</span>
                            </div>

                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                Sẵn Sàng Bắt Đầu?
                            </h3>

                            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                                Hãy thảo luận về dự án của bạn và tìm giải pháp hoàn hảo
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                                    <Link href="mailto:hokhachuy.dev@gmail.com">
                                        <Rocket className="w-5 h-5 mr-2" />
                                        Nhận Báo Giá Miễn Phí
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild className="border-2 border-blue-200 hover:border-blue-400 px-8 py-3 rounded-xl font-semibold">
                                    <Link href="/contact">
                                        Liên Hệ
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </Container>

            {/* Enhanced Modal */}
            {selectedPackage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1001]">
                    <div className="bg-white/95 backdrop-blur-sm dark:bg-slate-900/95 rounded-3xl max-w-5xl w-full max-h-[90vh] border border-white/20 dark:border-slate-700/20 shadow-2xl flex flex-col">
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                            <div className="p-8">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            'p-4 rounded-2xl bg-gradient-to-br shadow-lg text-white',
                                            selectedPackage.gradient
                                        )}>
                                            {selectedPackage.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                                                {selectedPackage.name}
                                            </h2>
                                            <p className="text-slate-600 dark:text-slate-400 text-lg">
                                                {selectedPackage.description}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setSelectedPackage(null)}
                                        className="text-slate-500 hover:text-slate-700 p-2 rounded-full"
                                    >
                                        <X className="w-6 h-6" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Features */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Check className="w-5 h-5 text-emerald-500" />
                                                Tính Năng Bao Gồm
                                            </h3>
                                            <ul className="space-y-3">
                                                {selectedPackage.features.map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mt-0.5">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-slate-700 dark:text-slate-300 text-sm">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {selectedPackage.notIncluded && (
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <X className="w-5 h-5 text-red-500" />
                                                    Không Bao Gồm
                                                </h3>
                                                <ul className="space-y-3">
                                                    {selectedPackage.notIncluded.map((feature, index) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                            <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                                                            <span className="text-slate-700 dark:text-slate-300 text-sm">
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Details */}
                                    <div className="space-y-6">
                                        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl">
                                            <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-2">
                                                Giá Gói
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-600 dark:text-slate-400">Giá cơ bản:</span>
                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                        {selectedPackage.basePrice > 0 ? `${selectedPackage.basePrice}tr` : 'Thỏa thuận'}
                                                    </span>
                                                </div>
                                                {selectedDesign !== 'template-existing' && selectedPackage.basePrice > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-600 dark:text-slate-400">Design option:</span>
                                                        <span className="font-semibold text-slate-900 dark:text-white">
                                                            +{Math.round(selectedPackage.basePrice * (designOptions.find(d => d.id === selectedDesign)?.priceMultiplier || 0) * 100) / 100}tr
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedFeatures.length > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-600 dark:text-slate-400">Tính năng bổ sung:</span>
                                                        <span className="font-semibold text-slate-900 dark:text-white">
                                                            +{selectedFeatures.reduce((total, featureId) => {
                                                                const feature = additionalFeatures.find(f => f.id === featureId)
                                                                return total + (feature?.price || 0)
                                                            }, 0)}tr
                                                        </span>
                                                    </div>
                                                )}
                                                {contractType === 'company' && selectedPackage.basePrice > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-600 dark:text-slate-400">VAT (10%):</span>
                                                        <span className="font-semibold text-slate-900 dark:text-white">
                                                            +{Math.round(((selectedPackage.basePrice + (selectedPackage.basePrice * (designOptions.find(d => d.id === selectedDesign)?.priceMultiplier || 0.0))) + selectedFeatures.reduce((total, featureId) => {
                                                                const feature = additionalFeatures.find(f => f.id === featureId)
                                                                return total + (feature?.price || 0)
                                                            }, 0)) * 0.1 * 100) / 100}tr
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="border-t pt-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-slate-900 dark:text-white">Tổng cộng:</span>
                                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                            {selectedPackage.basePrice > 0 ? `${finalPrice}tr` : 'Thỏa thuận'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {selectedPackage.period}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                                    ⏱️ Thời Gian Thực Hiện
                                                </h4>
                                                <p className="text-slate-700 dark:text-slate-300">
                                                    {selectedPackage.timeline}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                                    🛠️ Công Nghệ Sử Dụng
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPackage.techStack.map((tech, index) => (
                                                        <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                                    🎯 Hỗ Trợ & Bảo Hành
                                                </h4>
                                                <p className="text-slate-700 dark:text-slate-300 text-sm">
                                                    {selectedPackage.support}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Design Options */}
                                {selectedPackage.id !== 'custom' && (
                                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Rocket className="w-5 h-5 text-blue-500" />
                                            Chọn Phương Thức Thiết Kế
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            {designOptions.map((option) => (
                                                <div key={option.id} className={clsx(
                                                    'p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                                                    selectedDesign === option.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                                )}>
                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="design"
                                                            value={option.id}
                                                            checked={selectedDesign === option.id}
                                                            onChange={() => handleDesignChange(option.id)}
                                                            className="sr-only"
                                                        />
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                                                {option.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="font-semibold text-slate-900 dark:text-white">
                                                                        {option.name}
                                                                    </h4>
                                                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                        {option.priceMultiplier === 0.0 ? 'Miễn phí' : `+${Math.round(option.priceMultiplier * 100)}%`}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {option.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contract Type */}
                                {selectedPackage.id !== 'custom' && (
                                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-500" />
                                            Chọn Loại Hợp Đồng
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            <div className={clsx(
                                                'p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                                                contractType === 'freelancer'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                            )}>
                                                <label className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="contract"
                                                        value="freelancer"
                                                        checked={contractType === 'freelancer'}
                                                        onChange={() => handleContractChange('freelancer')}
                                                        className="sr-only"
                                                    />
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                                            <Star className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                                Hợp Đồng Freelancer
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                Không VAT - Giá như hiển thị
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            <div className={clsx(
                                                'p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                                                contractType === 'company'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                            )}>
                                                <label className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="contract"
                                                        value="company"
                                                        checked={contractType === 'company'}
                                                        onChange={() => handleContractChange('company')}
                                                        className="sr-only"
                                                    />
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                                            <Crown className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                                Hợp Đồng Công Ty
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                Có VAT 10% - Có hóa đơn đỏ
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Features Selection */}
                                {selectedPackage.id !== 'custom' && (
                                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-blue-500" />
                                            Tính Năng Bổ Sung
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {additionalFeatures.map((feature) => (
                                                <div key={feature.id} className="flex items-start gap-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-white/20 dark:border-slate-700/20">
                                                    <input
                                                        type="checkbox"
                                                        id={feature.id}
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onChange={() => handleFeatureToggle(feature.id)}
                                                        className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <div className="flex-1">
                                                        <label htmlFor={feature.id} className="flex items-center gap-2 cursor-pointer">
                                                            <div className="p-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                                                {feature.icon}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                                    {feature.name}
                                                                </div>
                                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {feature.description}
                                                                </div>
                                                            </div>
                                                        </label>
                                                        <div className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                                                            +{feature.price}tr
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button
                                            onClick={handleOrderClick}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                                        >
                                            <Rocket className="w-5 h-5 mr-2" />
                                            {selectedPackage.basePrice > 0 ? `Đặt Gói ${finalPrice}tr` : 'Liên Hệ Ngay'}
                                        </Button>
                                        <Button variant="outline" onClick={() => setSelectedPackage(null)} className="border-2 border-blue-200 hover:border-blue-400 px-8 py-3 rounded-xl font-semibold">
                                            Đóng
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1002]">
                    <div className="bg-white/95 backdrop-blur-sm dark:bg-slate-900/95 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-700/20 shadow-2xl">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Thông Tin Liên Hệ
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Vui lòng điền thông tin để chúng tôi liên hệ báo giá
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowContactForm(false)}
                                    className="text-slate-500 hover:text-slate-700 p-2 rounded-full"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <form action="https://formsubmit.co/hokhachuy.dev@gmail.com" method="POST" onSubmit={handleContactSubmit} className="space-y-6">
                                {/* FormSubmit Configuration */}
                                <input type="hidden" name="_subject" value={`Đặt gói ${selectedPackage?.name} - XNK Minh Phúc`} />
                                <input type="hidden" name="_next" value="https://huyhk.dev/pricing/xnkminhphuc" />
                                <input type="hidden" name="_template" value="table" />
                                <input type="hidden" name="_captcha" value="false" />
                                <input type="hidden" name="_autoresponse" value="Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ." />

                                {/* Package Information */}
                                <input type="hidden" name="goi_da_chon" value={selectedPackage?.name} />
                                <input type="hidden" name="gia_co_ban" value={`${selectedPackage?.basePrice}tr`} />
                                <input type="hidden" name="design_option" value={designOptions.find(d => d.id === selectedDesign)?.name} />
                                <input type="hidden" name="gia_design" value={`x${designOptions.find(d => d.id === selectedDesign)?.priceMultiplier}`} />
                                <input type="hidden" name="loai_hop_dong" value={contractType === 'freelancer' ? 'Freelancer' : 'Công ty (có VAT 10%)'} />
                                <input type="hidden" name="tinh_nang_bo_sung" value={selectedFeatures.map(id => additionalFeatures.find(f => f.id === id)?.name).join(', ')} />
                                <input type="hidden" name="tong_gia_cuoi_cung" value={`${finalPrice}tr`} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Họ và tên *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={contactForm.name}
                                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={contactForm.email}
                                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Số điện thoại *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            required
                                            value={contactForm.phone}
                                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0123456789"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Công ty
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={contactForm.company}
                                            onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Tên công ty (tùy chọn)"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Yêu cầu thêm
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        value={contactForm.message}
                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Mô tả thêm về dự án của bạn..."
                                    />
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                        Tóm tắt đơn hàng:
                                    </h4>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                        <div>Gói: {selectedPackage?.name}</div>
                                        <div>Design: {designOptions.find(d => d.id === selectedDesign)?.name}</div>
                                        <div>Hợp đồng: {contractType === 'freelancer' ? 'Freelancer' : 'Công ty (VAT 10%)'}</div>
                                        {selectedFeatures.length > 0 && (
                                            <div>Tính năng: {selectedFeatures.map(id => additionalFeatures.find(f => f.id === id)?.name).join(', ')}</div>
                                        )}
                                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                                            Tổng: {finalPrice}tr
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        type="submit"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                                    >
                                        <Rocket className="w-5 h-5 mr-2" />
                                        Gửi Yêu Cầu Báo Giá
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowContactForm(false)}
                                        className="border-2 border-blue-200 hover:border-blue-400 px-8 py-3 rounded-xl font-semibold"
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default XNKMinhPhucPricingContent 