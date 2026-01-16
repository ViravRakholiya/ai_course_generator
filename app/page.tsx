"use client";

import { useState, useEffect } from "react";
import { generateCourse } from "@/app/actions/generate-course";
import {
    getAllCourses,
    getCourseById,
    updateCourse,
    updateModule,
    deleteCourse,
} from "@/app/actions/course-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { GenerateCourseResponse } from "@/types";
import { DIFFICULTY_LEVELS } from "@/types";

interface Course {
    id: string;
    title: string;
    topic: string;
    difficulty: string;
    description: string | null;
    moduleCount: number;
    createdAt: string;
}

interface CourseDetail {
    id: string;
    title: string;
    topic: string;
    difficulty: string;
    description: string | null;
    modules: Array<{
        id: string;
        title: string;
        description: string;
        order: number;
        duration: string | null;
    }>;
}

/**
 * Main page component for the AI Course Syllabus Generator
 *
 * Features:
 * - Generate new AI-powered course syllabi
 * - View all existing courses
 * - Edit course details and modules
 */
export default function Home() {
    const [activeTab, setActiveTab] = useState("generate");

    // Generate state
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] =
        useState<(typeof DIFFICULTY_LEVELS)[number]>("beginner");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateResult, setGenerateResult] =
        useState<GenerateCourseResponse | null>(null);

    // View state
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(
        null
    );
    const [isLoadingCourse, setIsLoadingCourse] = useState(false);

    // Edit state
    const [editingCourse, setEditingCourse] = useState<CourseDetail | null>(
        null
    );
    const [editingModule, setEditingModule] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load courses when switching to view tab
    useEffect(() => {
        if (activeTab === "view" && courses.length === 0) {
            loadCourses();
        }
    }, [activeTab, courses.length]);

    const loadCourses = async () => {
        setIsLoadingCourses(true);
        try {
            const result = await getAllCourses();
            if (result.success) {
                setCourses(result.courses);
            }
        } catch (error) {
            console.error("Error loading courses:", error);
        } finally {
            setIsLoadingCourses(false);
        }
    };

    const loadCourse = async (courseId: string) => {
        setIsLoadingCourse(true);
        try {
            const result = await getCourseById(courseId);
            if (result.success && result.course) {
                setSelectedCourse(result.course);
                setEditingCourse(result.course);
            }
        } catch (error) {
            console.error("Error loading course:", error);
        } finally {
            setIsLoadingCourse(false);
        }
    };

    const handleUpdateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingCourse) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("courseId", editingCourse.id);
            formData.append("title", editingCourse.title);
            formData.append("description", editingCourse.description || "");
            formData.append("topic", editingCourse.topic);
            formData.append("difficulty", editingCourse.difficulty);

            const result = await updateCourse(formData);
            if (result.success && result.course) {
                setEditingCourse(result.course);
                setSelectedCourse(result.course);
                loadCourses();
            }
        } catch (error) {
            console.error("Error updating course:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateModule = async (
        moduleId: string,
        title: string,
        description: string,
        duration: string
    ) => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("moduleId", moduleId);
            formData.append("title", title);
            formData.append("description", description);
            formData.append("duration", duration || "");

            const result = await updateModule(formData);
            if (result.success && editingCourse) {
                const updatedModules = editingCourse.modules.map((m) =>
                    m.id === moduleId ? { ...m, ...result.module } : m
                );
                setEditingCourse({ ...editingCourse, modules: updatedModules });
                setEditingModule(null);
            }
        } catch (error) {
            console.error("Error updating module:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!topic.trim()) {
            return;
        }

        setIsGenerating(true);
        setGenerateResult(null);

        try {
            const formData = new FormData();
            formData.append("topic", topic);
            formData.append("difficulty", difficulty);

            const response = await generateCourse(formData);
            setGenerateResult(response);

            if (response.success) {
                setTopic("");
                // Reload courses if on view tab
                if (activeTab === "view") {
                    loadCourses();
                }
            }
        } catch (error) {
            setGenerateResult({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm("Are you sure you want to delete this course?")) return;

        try {
            const result = await deleteCourse(courseId);
            if (result.success) {
                loadCourses();
                if (selectedCourse?.id === courseId) {
                    setSelectedCourse(null);
                    setEditingCourse(null);
                }
            }
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "intermediate":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "advanced":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        AI Course Syllabus Generator
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Create, manage, and edit comprehensive course syllabi
                        powered by AI
                    </p>
                </div>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                        <TabsTrigger value="generate">Generate</TabsTrigger>
                        <TabsTrigger value="view">My Courses</TabsTrigger>
                    </TabsList>

                    {/* Generate Tab */}
                    <TabsContent value="generate" className="space-y-6">
                        <Card className="border-2 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                                <CardTitle className="text-2xl">
                                    Generate New Course
                                </CardTitle>
                                <CardDescription className="text-blue-100">
                                    Enter a topic and select a difficulty level
                                    to generate a complete course syllabus
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form
                                    onSubmit={handleGenerate}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="topic"
                                            className="text-sm font-medium"
                                        >
                                            Course Topic
                                        </label>
                                        <Input
                                            id="topic"
                                            name="topic"
                                            type="text"
                                            placeholder="e.g., React Development, Machine Learning, Web Design"
                                            value={topic}
                                            onChange={(e) =>
                                                setTopic(e.target.value)
                                            }
                                            required
                                            disabled={isGenerating}
                                            className="text-lg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="difficulty"
                                            className="text-sm font-medium"
                                        >
                                            Difficulty Level
                                        </label>
                                        <Select
                                            id="difficulty"
                                            name="difficulty"
                                            value={difficulty}
                                            onChange={(e) =>
                                                setDifficulty(
                                                    e.target
                                                        .value as (typeof DIFFICULTY_LEVELS)[number]
                                                )
                                            }
                                            disabled={isGenerating}
                                            className="text-lg"
                                        >
                                            <option value="beginner">
                                                Beginner
                                            </option>
                                            <option value="intermediate">
                                                Intermediate
                                            </option>
                                            <option value="advanced">
                                                Advanced
                                            </option>
                                        </Select>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isGenerating}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6"
                                    >
                                        {isGenerating
                                            ? "Generating..."
                                            : "✨ Generate Syllabus"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Error Display */}
                        {generateResult && !generateResult.success && (
                            <Card className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950">
                                <CardContent className="pt-6">
                                    <p className="text-red-600 dark:text-red-400">
                                        {generateResult.error ??
                                            "An error occurred"}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Success Display */}
                        {generateResult &&
                            generateResult.success &&
                            generateResult.course && (
                                <Card className="border-2 border-green-200 shadow-lg">
                                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                                        <CardTitle className="text-2xl">
                                            {generateResult.course.title}
                                        </CardTitle>
                                        <CardDescription className="text-green-100">
                                            {generateResult.course
                                                .description ??
                                                "No description available"}
                                        </CardDescription>
                                        <div className="flex gap-3 text-sm mt-2">
                                            <Badge
                                                className={getDifficultyColor(
                                                    generateResult.course
                                                        .difficulty
                                                )}
                                            >
                                                {
                                                    generateResult.course
                                                        .difficulty
                                                }
                                            </Badge>
                                            <span className="text-green-100">
                                                Topic:{" "}
                                                {generateResult.course.topic}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-semibold">
                                                Course Modules
                                            </h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {generateResult.course.modules.map(
                                                    (module) => (
                                                        <div
                                                            key={module.id}
                                                            className="border-2 rounded-lg p-4 bg-white dark:bg-slate-800 hover:shadow-md transition-all"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                                                    {
                                                                        module.order
                                                                    }
                                                                </div>
                                                                <div className="flex-1 space-y-2">
                                                                    <h4 className="font-semibold text-lg">
                                                                        {
                                                                            module.title
                                                                        }
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            module.description
                                                                        }
                                                                    </p>
                                                                    {module.duration && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-xs"
                                                                        >
                                                                            ⏱️{" "}
                                                                            {
                                                                                module.duration
                                                                            }
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                    </TabsContent>

                    {/* View Tab */}
                    <TabsContent value="view" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">My Courses</h2>
                            <Button
                                onClick={loadCourses}
                                variant="outline"
                                disabled={isLoadingCourses}
                            >
                                {isLoadingCourses ? "Loading..." : "Refresh"}
                            </Button>
                        </div>

                        {isLoadingCourses ? (
                            <div className="text-center py-12">
                                Loading courses...
                            </div>
                        ) : courses.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6 text-center py-12">
                                    <p className="text-muted-foreground">
                                        No courses yet. Generate your first
                                        course!
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {courses.map((course) => (
                                    <Card
                                        key={course.id}
                                        className="hover:shadow-lg transition-all cursor-pointer border-2"
                                        onClick={() => loadCourse(course.id)}
                                    >
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-xl line-clamp-2">
                                                    {course.title}
                                                </CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCourse(
                                                            course.id
                                                        );
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    🗑️
                                                </Button>
                                            </div>
                                            <CardDescription className="line-clamp-2">
                                                {course.description ||
                                                    "No description"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    className={getDifficultyColor(
                                                        course.difficulty
                                                    )}
                                                >
                                                    {course.difficulty}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {course.moduleCount} modules
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(
                                                    course.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Edit Course Section */}
                        {isLoadingCourse ? (
                            <div className="text-center py-12">
                                Loading course details...
                            </div>
                        ) : editingCourse ? (
                            <div className="space-y-6 mt-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold">
                                        Edit Course
                                    </h2>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditingCourse(null);
                                            setSelectedCourse(null);
                                        }}
                                    >
                                        Close
                                    </Button>
                                </div>

                                <Card className="border-2 shadow-lg">
                                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                                        <CardTitle className="text-2xl">
                                            Edit Course Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <form
                                            onSubmit={handleUpdateCourse}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Course Title
                                                </label>
                                                <Input
                                                    value={editingCourse.title}
                                                    onChange={(e) =>
                                                        setEditingCourse({
                                                            ...editingCourse,
                                                            title: e.target
                                                                .value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Topic
                                                </label>
                                                <Input
                                                    value={editingCourse.topic}
                                                    onChange={(e) =>
                                                        setEditingCourse({
                                                            ...editingCourse,
                                                            topic: e.target
                                                                .value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Description
                                                </label>
                                                <Textarea
                                                    value={
                                                        editingCourse.description ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setEditingCourse({
                                                            ...editingCourse,
                                                            description:
                                                                e.target.value,
                                                        })
                                                    }
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Difficulty
                                                </label>
                                                <Select
                                                    value={
                                                        editingCourse.difficulty
                                                    }
                                                    onChange={(e) =>
                                                        setEditingCourse({
                                                            ...editingCourse,
                                                            difficulty:
                                                                e.target.value,
                                                        })
                                                    }
                                                >
                                                    <option value="beginner">
                                                        Beginner
                                                    </option>
                                                    <option value="intermediate">
                                                        Intermediate
                                                    </option>
                                                    <option value="advanced">
                                                        Advanced
                                                    </option>
                                                </Select>
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                className="w-full"
                                            >
                                                {isSaving
                                                    ? "Saving..."
                                                    : "💾 Save Course"}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-2xl">
                                            Edit Modules
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            {editingCourse.modules.map(
                                                (module) => (
                                                    <div
                                                        key={module.id}
                                                        className="border-2 rounded-lg p-4"
                                                    >
                                                        {editingModule ===
                                                        module.id ? (
                                                            <form
                                                                onSubmit={(
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    const form =
                                                                        e.target as HTMLFormElement;
                                                                    handleUpdateModule(
                                                                        module.id,
                                                                        (
                                                                            form.elements.namedItem(
                                                                                "title"
                                                                            ) as HTMLInputElement
                                                                        ).value,
                                                                        (
                                                                            form.elements.namedItem(
                                                                                "description"
                                                                            ) as HTMLTextAreaElement
                                                                        ).value,
                                                                        (
                                                                            form.elements.namedItem(
                                                                                "duration"
                                                                            ) as HTMLInputElement
                                                                        ).value
                                                                    );
                                                                }}
                                                                className="space-y-3"
                                                            >
                                                                <Input
                                                                    name="title"
                                                                    defaultValue={
                                                                        module.title
                                                                    }
                                                                    required
                                                                />
                                                                <Textarea
                                                                    name="description"
                                                                    defaultValue={
                                                                        module.description
                                                                    }
                                                                    rows={2}
                                                                    required
                                                                />
                                                                <Input
                                                                    name="duration"
                                                                    placeholder="e.g., 2 hours"
                                                                    defaultValue={
                                                                        module.duration ||
                                                                        ""
                                                                    }
                                                                />
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        type="submit"
                                                                        size="sm"
                                                                        disabled={
                                                                            isSaving
                                                                        }
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            setEditingModule(
                                                                                null
                                                                            )
                                                                        }
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold">
                                                                    {
                                                                        module.order
                                                                    }
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-lg">
                                                                        {
                                                                            module.title
                                                                        }
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        {
                                                                            module.description
                                                                        }
                                                                    </p>
                                                                    {module.duration && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="mt-2 text-xs"
                                                                        >
                                                                            ⏱️{" "}
                                                                            {
                                                                                module.duration
                                                                            }
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setEditingModule(
                                                                            module.id
                                                                        )
                                                                    }
                                                                >
                                                                    ✏️ Edit
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : null}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
