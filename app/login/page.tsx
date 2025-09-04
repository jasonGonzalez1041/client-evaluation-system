import Link from "next/link";

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Columna izquierda - Formulario */}
                    <div className="md:w-1/2 p-8">
                        <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block">
                            ← Ir al Formulario
                        </Link>
                        
                        <div className="max-w-sm mx-auto">
                            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
                                Iniciar Sesión
                            </h2>
                            
                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                        Usuario
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Ingresa tu usuario"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Ingresa tu contraseña"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                                >
                                    Iniciar Sesión
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Columna derecha - Imagen/Demo */}
                    <div className="md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-8 flex items-center justify-center">
                        <div className="text-center text-white">
                            {/* Puedes reemplazar esto con una imagen real */}
                            <div className="mb-6">
                                <svg className="mx-auto h-24 w-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-2xl font-bold mb-4">
                                Sistema de Evaluación de Clientes
                            </h3>
                            
                            <p className="text-lg opacity-90 mb-6">
                                Gestiona y evalúa a tus clientes de manera eficiente con nuestro sistema integral
                            </p>
                            
                            <div className="space-y-3 text-left max-w-xs mx-auto">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Evaluaciones detalladas
                                </div>
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Reportes automáticos
                                </div>
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Seguimiento en tiempo real
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}