"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DogCard } from "./DogCard";
import { TabHeader } from "./TabHeader";
import { EmptyState } from "./EmptyState";
import type { Dog } from "../types";

interface DogsTabProps {
  dogs: Dog[];
}

export function DogsTab({ dogs }: DogsTabProps) {
  return (
    <Card className="shadow-xl bg-purple-50">
      <CardContent className="p-4 md:p-6">
        <TabHeader
          title="My Dogs"
          actions={
            <Link href="/profile/care-provider/create-dog">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Add New Dog
              </Button>
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>

        {dogs.length === 0 && (
          <EmptyState
            message="No dogs added yet"
            actionLabel="Add Your First Dog"
            actionHref="/profile/care-provider/create-dog"
          />
        )}
      </CardContent>
    </Card>
  );
}
