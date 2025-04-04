'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from './utils';
import * as d3 from 'd3';

interface NotionData {
    RoleID: string;
    RoleName: string;
    CircleID: string;
    Purpose?: string;
    Responsibilities?: string;
    Projects?: { id: string; title?: string }[];
    'Pessoas alocadas'?: { id: string; title?: string }[];
    Area?: string;
    pageId: string;
}

interface CircleData {
    CircleID: string;
    CircleName: string;
    Purpose?: string;
    Responsibilities?: string;
    Projects?: string;
}

export default function NotionToD3Converter() {
    const [notionKey, setNotionKey] = useState('');
    const [rolesDatabaseId, setRolesDatabaseId] = useState('');
    const [circlesDatabaseId, setCirclesDatabaseId] = useState('');
    const [rolesData, setRolesData] = useState<NotionData[] | null>(null);
    const [circlesData, setCirclesData] = useState<CircleData[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFormMinimized, setIsFormMinimized] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUsingEnvKey, setIsUsingEnvKey] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const storedNotionKey = localStorage.getItem('notionKey');
        const storedRolesDatabaseId = localStorage.getItem('rolesDatabaseId');
        const storedCirclesDatabaseId = localStorage.getItem('circlesDatabaseId');

        if (storedNotionKey) setNotionKey(storedNotionKey);
        if (storedRolesDatabaseId) setRolesDatabaseId(storedRolesDatabaseId);
        if (storedCirclesDatabaseId) setCirclesDatabaseId(storedCirclesDatabaseId);

        // Removemos a verificação da chave do ambiente pois agora é server-side
    }, []);

    useEffect(() => {
        if (rolesData && circlesData && svgRef.current) {
            createVisualization();
        }
    }, [rolesData, circlesData]);

    // Auto-minimize form when data is loaded
    useEffect(() => {
        if (rolesData && circlesData) {
            setIsFormMinimized(true);
        }
    }, [rolesData, circlesData]);

    // Função para verificar se um papel corresponde ao termo de busca
    const matchesSearch = (roleData: any, searchTerm: string) => {
        if (!searchTerm) return false;
        const searchLower = searchTerm.toLowerCase();
        
        // Verifica se o termo de busca está no nome, propósito ou responsabilidades do papel
        const roleMatches = 
            roleData.name?.toLowerCase().includes(searchLower) ||
            roleData.purpose?.toLowerCase().includes(searchLower) ||
            roleData.responsibilities?.toLowerCase().includes(searchLower);

        // Verifica se o termo de busca está no nome de alguma pessoa alocada
        const peopleMatch = roleData['Pessoas alocadas']?.some((person: any) => 
            person.title?.toLowerCase().includes(searchLower)
        );

        return roleMatches || peopleMatch;
    };

    const createVisualization = () => {
        if (!rolesData || !circlesData || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 800;
        const height = 600;
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };

        // Verifica se os dados são arrays válidos
        if (!Array.isArray(rolesData) || !Array.isArray(circlesData)) {
            console.error('Dados inválidos: rolesData ou circlesData não são arrays');
            return;
        }

        // Cria a hierarquia de dados
        const hierarchy = {
            name: "Organização",
            children: circlesData.map(circle => ({
                name: circle.CircleName,
                id: circle.CircleID,
                purpose: circle.Purpose,
                responsibilities: circle.Responsibilities,
                children: rolesData
                    .filter(role => {
                        const roleCircleID = typeof role.CircleID === 'number' ? role.CircleID : parseInt(role.CircleID);
                        const circleID = typeof circle.CircleID === 'number' ? circle.CircleID : parseInt(circle.CircleID);
                        return roleCircleID === circleID;
                    })
                    .map(role => ({
                        name: role.RoleName,
                        id: role.RoleID,
                        purpose: role.Purpose,
                        responsibilities: role.Responsibilities,
                        'Pessoas alocadas': role['Pessoas alocadas'],
                        pageId: role.pageId,
                        value: 1
                    }))
            }))
        };

        // Cria o layout de empacotamento
        const pack = d3.pack()
            .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
            .padding(3);

        // Cria a hierarquia e aplica o layout
        const root = d3.hierarchy(hierarchy)
            .sum(d => d.value || 0)
            .sort((a, b) => b.value - a.value);

        const nodes = pack(root).descendants();

        // Cria o grupo principal
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Adiciona os círculos
        const node = g.selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Adiciona os círculos
        node.append("circle")
            .attr("r", d => d.r)
            .style("fill", d => {
                if (d.depth === 0) return "#4f46e5"; // Círculo raiz
                if (d.depth === 1) return "#10b981"; // Círculos
                return "#f3f4f6"; // Papéis
            })
            .style("stroke", "#fff")
            .style("stroke-width", 2);

        // Adiciona os textos
        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style("font-size", d => {
                if (d.depth === 0) return "16px";
                if (d.depth === 1) return "14px";
                return "6px"; // Reduced font size for roles
            })
            .text(d => {
                if (d.r < 20) return ""; // Não mostra texto em círculos muito pequenos
                return d.data.name;
            });

        // Atualiza o highlight baseado no termo de busca
        const updateHighlight = (searchTerm: string) => {
            node.selectAll("circle")
                .style("fill", d => {
                    if (d.depth === 0) return "#4f46e5"; // Círculo raiz
                    if (d.depth === 1) return "#10b981"; // Círculos
                    if (d.depth === 2 && matchesSearch(d.data, searchTerm)) return "#fbbf24"; // Papéis destacados
                    return "#f3f4f6"; // Papéis normais
                });
        };

        // Adiciona tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "10px")
            .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)")
            .style("z-index", "1000")
            .style("max-width", "300px");

        // Adiciona interatividade
        node.on("mouseover", function(event, d) {
            if (d.depth === 2) { // Apenas para papéis
                const roleData = d.data;
                console.log('Dados do papel para tooltip:', roleData);
                
                // Formata as responsabilidades como lista
                const formatResponsibilities = (text: string) => {
                    if (!text) return '';
                    return text.split('-').filter(item => item.trim())
                        .map(item => `<li>${item.trim()}</li>`)
                        .join('');
                };

                const tooltipContent = `
                    <div class="space-y-2">
                        <h3 class="font-bold">${roleData.name || ''}</h3>
                        ${roleData.purpose ? `<p><strong>Propósito:</strong> ${roleData.purpose}</p>` : ''}
                        ${roleData.responsibilities ? `
                            <div>
                                <strong>Responsabilidades:</strong>
                                <ul class="list-disc pl-4 mt-1">
                                    ${formatResponsibilities(roleData.responsibilities)}
                                </ul>
                            </div>
                        ` : ''}
                        ${roleData['Pessoas alocadas']?.length ? `
                            <div>
                                <strong>Pessoas alocadas:</strong>
                                <ul class="list-disc pl-4 mt-1">
                                    ${roleData['Pessoas alocadas'].map((person: any) => `<li>${person.title || person.name || person.id}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `;
                tooltip.html(tooltipContent)
                    .style("visibility", "visible")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            } else if (d.depth === 1) { // Para círculos
                const circleData = d.data;
                console.log('Dados do círculo para tooltip:', circleData);
                
                // Formata as responsabilidades como lista
                const formatResponsibilities = (text: string) => {
                    if (!text) return '';
                    return text.split('-').filter(item => item.trim())
                        .map(item => `<li>${item.trim()}</li>`)
                        .join('');
                };

                const tooltipContent = `
                    <div class="space-y-2">
                        <h3 class="font-bold">${circleData.name}</h3>
                        ${circleData.purpose ? `<p><strong>Propósito:</strong> ${circleData.purpose}</p>` : ''}
                        ${circleData.responsibilities ? `
                            <div>
                                <strong>Responsabilidades:</strong>
                                <ul class="list-disc pl-4 mt-1">
                                    ${formatResponsibilities(circleData.responsibilities)}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `;
                tooltip.html(tooltipContent)
                    .style("visibility", "visible")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            }

            d3.select(this).select("circle")
                .style("stroke-width", 3)
                .style("stroke", "#000");
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            d3.select(this).select("circle")
                .style("stroke-width", 2)
                .style("stroke", "#fff");
        })
        .on("click", function(event, d) {
            if (d.depth === 1) { // Círculo
                // Implementa o zoom
                const scale = 1.5;
                const duration = 750;
                
                const g = d3.select(svgRef.current).select("g");
                const circle = d3.select(this).select("circle");
                
                // Anima o zoom
                g.transition()
                    .duration(duration)
                    .attr("transform", `translate(${width/2},${height/2}) scale(${scale}) translate(${-d.x},${-d.y})`);
                
                // Destaca o círculo
                circle.transition()
                    .duration(duration)
                    .style("stroke-width", 4)
                    .style("stroke", "#000");
            } else if (d.depth === 2) { // Papel
                // Abre a página do Notion em nova aba
                const pageId = d.data.pageId;
                if (pageId) {
                    const notionUrl = `https://www.notion.so/${pageId.replace(/-/g, '')}`;
                    window.open(notionUrl, '_blank');
                }
            }
        });

        // Adiciona evento de clique no SVG para zoom out
        svg.on("click", function(event) {
            // Verifica se o clique foi em um nó
            const target = event.target;
            if (target.tagName === 'circle' || target.tagName === 'text') {
                return; // Não faz nada se clicou em um nó
            }

            // Faz zoom out
            const g = d3.select(svgRef.current).select("g");
            g.transition()
                .duration(750)
                .attr("transform", `translate(${margin.left},${margin.top}) scale(1)`);

            // Remove destaque de todos os círculos
            d3.select(svgRef.current).selectAll("circle")
                .transition()
                .duration(750)
                .style("stroke-width", 2)
                .style("stroke", "#fff");
        });
    };

    const fetchDataFromNotion = async (databaseId: string, isRolesData: boolean) => {
        if (!notionKey) {
            setError('Por favor, insira sua chave da API do Notion.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/notion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    databaseId,
                    notionKey,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (isRolesData) {
                setRolesData(data);
            } else {
                setCirclesData(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Erro ao buscar dados do Notion. Verifique suas credenciais e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchData = async () => {
        if (!rolesDatabaseId || !circlesDatabaseId) {
            setError('Por favor, insira os IDs dos bancos de dados de Papéis e Círculos.');
            return;
        }
        localStorage.setItem('notionKey', notionKey);
        localStorage.setItem('rolesDatabaseId', rolesDatabaseId);
        localStorage.setItem('circlesDatabaseId', circlesDatabaseId);

        await fetchDataFromNotion(rolesDatabaseId, true);
        await fetchDataFromNotion(circlesDatabaseId, false);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Botão flutuante para mostrar/esconder formulário */}
                <div className="fixed top-4 right-4 z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFormMinimized(!isFormMinimized)}
                        className="rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-sm"
                    >
                        {isFormMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Formulário de inputs */}
                <div className={`mb-8 transition-all duration-300 ${isFormMinimized ? 'hidden' : ''}`}>
                    <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold text-gray-800">Notion para D3.js</h1>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="notionKey" className="block text-sm font-medium text-gray-700">
                                            Chave da API do Notion
                                        </label>
                                        {isUsingEnvKey && !notionKey && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                                Usando chave do ambiente
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        id="notionKey"
                                        type="password"
                                        value={notionKey}
                                        onChange={(e) => {
                                            setNotionKey(e.target.value);
                                            setIsUsingEnvKey(false);
                                        }}
                                        placeholder={isUsingEnvKey && !notionKey ? "Chave do ambiente em uso" : "Insira sua chave da API do Notion"}
                                        className="mt-1"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {isUsingEnvKey && !notionKey 
                                            ? "A chave do ambiente está sendo usada. Para usar uma chave diferente, insira-a acima."
                                            : "Opcional. Se não fornecida, será usada a chave do ambiente."}
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="rolesDatabaseId" className="block text-sm font-medium text-gray-700">ID do Banco de Dados de Papéis</label>
                                    <Input
                                        id="rolesDatabaseId"
                                        type="text"
                                        value={rolesDatabaseId}
                                        onChange={(e) => setRolesDatabaseId(e.target.value)}
                                        placeholder="Insira o ID do Banco de Dados de Papéis"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="circlesDatabaseId" className="block text-sm font-medium text-gray-700">ID do Banco de Dados de Círculos</label>
                                    <Input
                                        id="circlesDatabaseId"
                                        type="text"
                                        value={circlesDatabaseId}
                                        onChange={(e) => setCirclesDatabaseId(e.target.value)}
                                        placeholder="Insira o ID do Banco de Dados de Círculos"
                                        className="mt-1"
                                    />
                                </div>
                                <Button
                                    onClick={handleFetchData}
                                    disabled={loading}
                                    className={cn(
                                        "w-full",
                                        loading && "cursor-not-allowed"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Carregando...
                                        </>
                                    ) : (
                                        "Buscar Dados do Notion"
                                    )}
                                </Button>
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Erro</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Área de visualização */}
                {rolesData && circlesData && (
                    <div className="bg-white rounded-lg shadow-lg p-4 overflow-auto">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col items-center space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800">Visualização</h2>
                                <input
                                    type="text"
                                    placeholder="Buscar papéis..."
                                    className="w-48 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => {
                                        const searchTerm = e.target.value;
                                        const node = d3.select(svgRef.current).selectAll("g");
                                        node.selectAll("circle")
                                            .style("fill", d => {
                                                if (d.depth === 0) return "#4f46e5"; // Círculo raiz
                                                if (d.depth === 1) return "#10b981"; // Círculos
                                                if (d.depth === 2 && matchesSearch(d.data, searchTerm)) return "#fbbf24"; // Papéis destacados
                                                return "#f3f4f6"; // Papéis normais
                                            });
                                    }}
                                />
                            </div>
                            <div className="flex justify-center">
                                <svg
                                    ref={svgRef}
                                    width={800}
                                    height={600}
                                    className="border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 