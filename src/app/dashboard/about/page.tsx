
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Zap, Award } from "lucide-react";
import Image from "next/image";

export default function DashboardAboutPage() {

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">À propos de TTR Gestion & du Programme</h1>
        <p className="text-muted-foreground">
          Découvrez notre mission et les règles de notre communauté.
        </p>
      </div>

       <section>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">Notre Histoire</h2>
              <p className="text-muted-foreground leading-relaxed">
                TTR Gestion est né d'une idée simple : donner aux petits commerçants les outils qu'ils méritent pour réussir. Fondée à Lomé en 2024, notre entreprise est partie du constat que de nombreux entrepreneurs talentueux étaient freinés par un manque d'outils de gestion simples et accessibles.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nous avons donc créé TTRGESTION, une application mobile qui transforme n'importe quel smartphone en un puissant outil de gestion commerciale. Aujourd'hui, notre programme d'ambassadeurs est le prolongement naturel de cette mission : créer une communauté de partenaires qui partagent notre vision et participent à notre croissance.
              </p>
            </div>
            <div className="relative h-60 w-60 lg:h-80 lg:w-80 mx-auto">
              <Image 
                  src="/logo2.png"
                  alt="Logo de TTR Gestion"
                  fill
                  className="rounded-lg object-contain"
              />
            </div>
          </div>
        </section>
      
      <section>
        <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl text-primary mb-12">
            Notre Engagement & Vos Responsabilités
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Award className="text-primary"/> Un Partenariat Sérieux
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                   <p>Notre programme est un business réel, pas une solution miracle. Il récompense le travail et l'engagement.</p>
                   <p>Nous ne sommes pas une pyramide de Ponzi. Vos revenus proviennent de commissions sur les ventes d'un produit concret : l'application TTRGESTION.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="text-primary"/> Une Entreprise Durable
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                   <p>TTR Gestion est une entreprise digitale agile et pérenne. Nous sommes là pour durer et pour grandir avec vous.</p>
                   <p>Notre modèle est construit sur la technologie et l'innovation, nous permettant de nous adapter et de nous développer sur le long terme.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="text-destructive"/> Code de Conduite
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                   <p>Toute tentative de triche, de fausse représentation ou de non-respect de nos valeurs entraînera un blocage immédiat et permanent de votre compte.</p>
                   <p>Nous attendons de nos ambassadeurs qu'ils agissent avec intégrité et professionnalisme.</p>
                </CardContent>
            </Card>
        </div>
      </section>

    </div>
  );
}
