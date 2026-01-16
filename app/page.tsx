'use client';

import { useState } from 'react';
import { generateCourse } from '@/app/actions/generate-course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GenerateCourseResponse } from '@/types';
import { DIFFICULTY_LEVELS } from '@/types';

/**
 * Main page component for the AI Course Syllabus Generator
 * 
 * Provides a clean UI for:
 * - Inputting course topic and difficulty level
 * - Generating AI-powered course syllabi
 * - Displaying the generated syllabus with modules
 */
export default function Home() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTY_LEVELS[number]>('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateCourseResponse | null>(null);

  /**
   * Handles form submission and course generation
   * 
   * Validates input, calls the server action, and updates state
   * with the result or error message.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('difficulty', difficulty);

      const response = await generateCourse(formData);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Course Syllabus Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Generate comprehensive course syllabi powered by AI
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Your Course</CardTitle>
            <CardDescription>
              Enter a topic and select a difficulty level to generate a complete course syllabus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="topic" className="text-sm font-medium">
                  Course Topic
                </label>
                <Input
                  id="topic"
                  name="topic"
                  type="text"
                  placeholder="e.g., React Development, Machine Learning, Web Design"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="difficulty" className="text-sm font-medium">
                  Difficulty Level
                </label>
                <Select
                  id="difficulty"
                  name="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof DIFFICULTY_LEVELS[number])}
                  disabled={isLoading}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Generating...' : 'Generate Syllabus'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {result && !result.success && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">
                {result.error ?? 'An error occurred'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Success Display */}
        {result && result.success && result.course && (
          <Card>
            <CardHeader>
              <CardTitle>{result.course.title}</CardTitle>
              <CardDescription>
                {result.course.description ?? 'No description available'}
              </CardDescription>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>Topic: {result.course.topic}</span>
                <span>•</span>
                <span>Difficulty: {result.course.difficulty}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Course Modules</h3>
                <div className="space-y-3">
                  {result.course.modules.map((module) => (
                    <div
                      key={module.id}
                      className="border rounded-lg p-4 bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {module.order}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold">{module.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                          {module.duration && (
                            <p className="text-xs text-muted-foreground">
                              Duration: {module.duration}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

