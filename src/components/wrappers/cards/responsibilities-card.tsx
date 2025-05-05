import { CheckCircle } from "lucide-react";
import React from "react";

interface CardProps {
    title: string;
    responsibilities: string[];
    techStack: string[];
}

const ResponsibilitiesCard: React.FC<CardProps> = ({
    title,
    responsibilities,
    techStack,
}) => {

    return (
        <div className="max-w-xl mx-auto p-6 border border-gray-200 rounded-2xl shadow-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">{title}</h3>
            <div className="mb-6">
                <div className="flex items-center mb-3">
                    <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-800">Key Tasks:</h4>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                    {responsibilities.map((item, index) => (
                        <li key={index} className="text-base">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div>

                <div className="flex items-center mb-3">
                    <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-800">Tech Stack:</h4>
                </div>
                <p className="text-gray-700 text-base bg-gray-100 p-3 rounded-md border border-gray-200">
                    
                    {techStack.map((item, index) => (
                        <span key={item+index} >
                            {item}
                        </span>
                    ))}
                </p>
            </div>
        </div>
    );
};

export default ResponsibilitiesCard;
