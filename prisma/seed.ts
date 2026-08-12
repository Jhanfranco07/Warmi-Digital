import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Warmi123!", 12);

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Administrador principal del sistema" }
  });
  const facilitatorRole = await prisma.role.upsert({
    where: { name: "FACILITADORA" },
    update: {},
    create: {
      name: "FACILITADORA",
      description: "Rol de facilitadoras y acompañamiento"
    }
  });
  const artisanRole = await prisma.role.upsert({
    where: { name: "ARTESANA" },
    update: {},
    create: { name: "ARTESANA", description: "Rol de artesanas en la plataforma" }
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@warmidigital.org" },
    update: { passwordHash },
    create: {
      email: "admin@warmidigital.org",
      passwordHash,
      userRoles: { create: [{ roleId: adminRole.id }] },
      profile: {
        create: {
          firstName: "Warmi",
          lastName: "Admin",
          displayName: "Administrador Warmi",
          locale: "es",
          bio: "Administrador principal de la plataforma Warmi Digital."
        }
      }
    }
  });

  const qantu = await prisma.community.upsert({
    where: { slug: "comunidad-qantu" },
    update: {},
    create: {
      name: "Comunidad Qantu",
      slug: "comunidad-qantu",
      description: "Comunidad de tejido tradicional andino.",
      location: "Cusco, Perú"
    }
  });
  await prisma.community.upsert({
    where: { slug: "comunidad-wayra" },
    update: {},
    create: {
      name: "Comunidad Wayra",
      slug: "comunidad-wayra",
      description: "Comunidad de bordado y textil ancestral.",
      location: "Puno, Perú"
    }
  });
  await prisma.community.upsert({
    where: { slug: "comunidad-kusi" },
    update: {},
    create: {
      name: "Comunidad Kusi",
      slug: "comunidad-kusi",
      description: "Comunidad de cerámica y trabajo con arcilla.",
      location: "Ayacucho, Perú"
    }
  });

  const textiles = await prisma.category.upsert({
    where: { name: "Textiles" },
    update: {},
    create: {
      name: "Textiles",
      description: "Piezas de tejido, bordado y prendas tradicionales."
    }
  });
  await prisma.category.upsert({
    where: { name: "Cerámica" },
    update: {},
    create: {
      name: "Cerámica",
      description: "Objetos de barro y piezas cerámicas con valor cultural."
    }
  });
  await prisma.category.upsert({
    where: { name: "Joyería" },
    update: {},
    create: {
      name: "Joyería",
      description: "Accesorios y piezas de metal con significado artesanal."
    }
  });

  const tejido = await prisma.craftType.upsert({
    where: { key: "TEJIDO" },
    update: {},
    create: {
      key: "TEJIDO",
      name: "Tejido",
      description: "Técnica de tejido tradicional."
    }
  });
  await prisma.craftType.upsert({
    where: { key: "BORDADO" },
    update: {},
    create: {
      key: "BORDADO",
      name: "Bordado",
      description: "Técnica de bordado artesanal."
    }
  });
  await prisma.craftType.upsert({
    where: { key: "CERAMICA" },
    update: {},
    create: {
      key: "CERAMICA",
      name: "Cerámica",
      description: "Técnica de cerámica ritual y utilitaria."
    }
  });

  const course = await prisma.course.upsert({
    where: { slug: "introduccion-patrimonio-textil" },
    update: { status: "PUBLISHED" },
    create: {
      title: "Introducción al patrimonio textil",
      slug: "introduccion-patrimonio-textil",
      description:
        "Ruta inicial para documentar y compartir el valor cultural del tejido.",
      level: "BEGINNER",
      status: "PUBLISHED"
    }
  });
  await prisma.course.upsert({
    where: { slug: "gestion-productos-culturales" },
    update: { status: "PUBLISHED" },
    create: {
      title: "Gestión de productos culturales",
      slug: "gestion-productos-culturales",
      description:
        "Curso para presentar piezas culturales con contexto, cuidado y claridad.",
      level: "INTERMEDIATE",
      status: "PUBLISHED"
    }
  });

  for (const badge of [
    ["Semilla Digital", "LEARNING", "Inició su primera ruta de aprendizaje digital."],
    ["Colorista Digital", "PROGRESS", "Avanzó en lecciones y talleres de práctica."],
    ["Emprendedora Digital", "IMPACT", "Publicó sus primeras piezas culturales."],
    ["Guardiana de la Tradición", "CULTURE", "Documentó el origen de su saber."],
    ["Maestra Warmi", "IMPACT", "Comparte aprendizajes con su comunidad."]
  ] as const) {
    await prisma.badge.upsert({
      where: { name: badge[0] },
      update: { type: badge[1], description: badge[2] },
      create: { name: badge[0], type: badge[1], description: badge[2] }
    });
  }

  const facilitator = await prisma.user.upsert({
    where: { email: "facilitadora@warmi.test" },
    update: { passwordHash },
    create: {
      email: "facilitadora@warmi.test",
      passwordHash,
      userRoles: { create: [{ roleId: facilitatorRole.id }] },
      profile: {
        create: {
          firstName: "Rosa",
          lastName: "Quispe",
          displayName: "Rosa Quispe",
          locale: "es",
          bio: "Facilitadora de aprendizaje digital y patrimonio cultural.",
          communityId: qantu.id
        }
      }
    }
  });

  await prisma.course.update({
    where: { id: course.id },
    data: { facilitatorId: facilitator.id, durationMin: 90 }
  });

  const artisan = await prisma.user.upsert({
    where: { email: "artesana@warmi.test" },
    update: { passwordHash },
    create: {
      email: "artesana@warmi.test",
      passwordHash,
      userRoles: { create: [{ roleId: artisanRole.id }] },
      profile: {
        create: {
          firstName: "Elena",
          lastName: "Mamani",
          displayName: "Elena Mamani",
          locale: "es",
          bio: "Artesana textil que preserva técnicas aprendidas en familia.",
          communityId: qantu.id,
          craftTypes: { create: [{ craftTypeId: tejido.id }] }
        }
      }
    }
  });

  await prisma.facilitatorAssignment.upsert({
    where: {
      facilitatorId_artisanId: { facilitatorId: facilitator.id, artisanId: artisan.id }
    },
    update: { status: "ACTIVE", communityId: qantu.id },
    create: {
      facilitatorId: facilitator.id,
      artisanId: artisan.id,
      communityId: qantu.id
    }
  });

  const moduleOne =
    (await prisma.module.findFirst({
      where: { courseId: course.id, title: "Primeros pasos digitales" }
    })) ??
    (await prisma.module.create({
      data: {
        courseId: course.id,
        title: "Primeros pasos digitales",
        description: "Aprende a registrar tu avance y cuidar tu historia.",
        order: 1,
        durationMin: 45
      }
    }));

  const lessonOne = await prisma.lesson.upsert({
    where: { slug: "presentar-mi-saber-textil" },
    update: {},
    create: {
      moduleId: moduleOne.id,
      title: "Presentar mi saber textil",
      slug: "presentar-mi-saber-textil",
      type: "TEXT",
      content:
        "Escribe una breve presentación de tu técnica, tu comunidad y el significado de una pieza importante.",
      durationMin: 15,
      order: 1
    }
  });
  await prisma.lesson.upsert({
    where: { slug: "fotografiar-mi-proceso" },
    update: {},
    create: {
      moduleId: moduleOne.id,
      title: "Fotografiar mi proceso",
      slug: "fotografiar-mi-proceso",
      type: "VIDEO",
      content:
        "Aprende a tomar fotografías claras de tu proceso artesanal usando tu celular.",
      durationMin: 20,
      order: 2
    }
  });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: artisan.id, courseId: course.id } },
    update: { status: "ACTIVE" },
    create: { userId: artisan.id, courseId: course.id, status: "ACTIVE" }
  });
  await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lessonOne.id }
    },
    update: { progress: 40, startedAt: new Date(), lastAccessedAt: new Date() },
    create: {
      enrollmentId: enrollment.id,
      lessonId: lessonOne.id,
      progress: 40,
      startedAt: new Date(),
      lastAccessedAt: new Date()
    }
  });
  await prisma.courseProgress.upsert({
    where: { enrollmentId: enrollment.id },
    update: { completedLessons: 0, totalLessons: 2, percentage: 0 },
    create: {
      enrollmentId: enrollment.id,
      completedLessons: 0,
      totalLessons: 2,
      percentage: 0
    }
  });

  const semilla = await prisma.badge.findUniqueOrThrow({
    where: { name: "Semilla Digital" }
  });
  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId: artisan.id, badgeId: semilla.id } },
    update: {},
    create: {
      userId: artisan.id,
      badgeId: semilla.id,
      reason: "Inició su camino de aprendizaje en Warmi Digital."
    }
  });

  const workshop = await prisma.workshop.create({
    data: {
      title: "Taller: contar la historia de una pieza",
      description:
        "Encuentro para practicar cómo narrar el origen y significado de una pieza cultural.",
      courseId: course.id,
      moduleId: moduleOne.id,
      facilitatorId: facilitator.id,
      mode: "HYBRID",
      status: "SCHEDULED",
      location: "Centro comunal Qantu",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 90)
    }
  });
  await prisma.workshopRegistration.upsert({
    where: { workshopId_userId: { workshopId: workshop.id, userId: artisan.id } },
    update: {},
    create: { workshopId: workshop.id, userId: artisan.id, status: "CONFIRMED" }
  });

  await prisma.story.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      userId: artisan.id,
      communityId: qantu.id,
      craftTypeId: tejido.id,
      title: "Los hilos que aprendí de mi abuela",
      summary: "Una historia familiar preservada en cada tejido.",
      content:
        "Mi historia nace en mi comunidad y en las manos de mi abuela. Cada pieza conserva memoria familiar y aprendizaje compartido.",
      publicName: "Elena Mamani",
      personalStory:
        "Aprendí mirando a mi abuela preparar los hilos y contar historias mientras tejía.",
      artisanJourney:
        "Empecé con piezas pequeñas para mi familia y hoy comparto tejidos de mi comunidad.",
      knowledgeOrigin: "El conocimiento viene de mi familia y de las mujeres mayores.",
      learnedFrom: "Mi abuela y mi madre",
      techniques: "Tejido en telar, combinación de colores naturales",
      culturalMeaning:
        "Mis tejidos representan cuidado, memoria y continuidad entre generaciones."
    }
  });

  const product = await prisma.product.upsert({
    where: { slug: "manta-qantu-memoria-familiar" },
    update: {},
    create: {
      artisanId: artisan.id,
      categoryId: textiles.id,
      communityId: qantu.id,
      craftTypeId: tejido.id,
      name: "Manta Qantu de memoria familiar",
      slug: "manta-qantu-memoria-familiar",
      description: "Pieza textil elaborada con técnica familiar.",
      culturalPhrase: "Cada hilo conserva una historia transmitida por generaciones.",
      story: "La manta representa el camino de aprendizaje de tres generaciones.",
      makingTime: "12 días",
      materials: "Fibra natural y tintes suaves",
      technique: "Tejido en telar",
      price: 180,
      status: "PUBLISHED"
    }
  });

  const showcaseArtisans = [
    {
      email: "maria@warmi.test",
      firstName: "María",
      lastName: "Huamán",
      name: "María Huamán",
      product: "Chumpi de los caminos",
      slug: "chumpi-caminos-maria",
      phrase: "Los caminos de mi comunidad viven en cada figura tejida."
    },
    {
      email: "juana@warmi.test",
      firstName: "Juana",
      lastName: "Quispe",
      name: "Juana Quispe",
      product: "Manta de amanecer",
      slug: "manta-amanecer-juana",
      phrase: "Los colores recuerdan la luz que llega a nuestra comunidad."
    },
    {
      email: "rosa@warmi.test",
      firstName: "Rosa",
      lastName: "Condori",
      name: "Rosa Condori",
      product: "Bolso de flores andinas",
      slug: "bolso-flores-andinas-rosa",
      phrase: "Cada flor bordada celebra a las mujeres que me enseñaron."
    }
  ];

  for (const item of showcaseArtisans) {
    const person = await prisma.user.upsert({
      where: { email: item.email },
      update: { passwordHash },
      create: {
        email: item.email,
        passwordHash,
        userRoles: { create: [{ roleId: artisanRole.id }] },
        profile: {
          create: {
            firstName: item.firstName,
            lastName: item.lastName,
            displayName: item.name,
            communityId: qantu.id,
            bio: "Artesana de demostración de Warmi Digital.",
            craftTypes: { create: [{ craftTypeId: tejido.id }] }
          }
        }
      }
    });
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: { status: "PUBLISHED", available: true },
      create: {
        artisanId: person.id,
        categoryId: textiles.id,
        communityId: qantu.id,
        craftTypeId: tejido.id,
        name: item.product,
        slug: item.slug,
        description: "Pieza cultural de demostración creada para la vitrina Warmi.",
        culturalPhrase: item.phrase,
        story:
          "Una pieza creada desde el aprendizaje familiar y el respeto por el patrimonio vivo.",
        culturalMeaning: "Memoria, cuidado y continuidad entre generaciones.",
        materials: "Fibra natural y tintes suaves",
        technique: "Tejido y bordado a mano",
        makingTime: "8 días",
        price: 160,
        status: "PUBLISHED"
      }
    });
  }
  await prisma.order.create({
    data: {
      buyerId: adminUser.id,
      status: "CONFIRMED",
      totalAmount: 180,
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1,
            unitPrice: 180,
            totalPrice: 180
          }
        ]
      }
    }
  });

  await prisma.announcement.create({
    data: {
      title: "Convocatoria para feria de saberes textiles",
      body: "Programa de participación para artesanas que desean presentar una pieza con historia documentada.",
      authorId: adminUser.id,
      communityId: qantu.id,
      publishedAt: new Date(),
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20)
    }
  });

  for (const notification of [
    {
      type: "LEARNING" as const,
      title: "Continúa tu primera lección",
      body: "Tu ruta de aprendizaje ya está lista para seguir avanzando."
    },
    {
      type: "COMMUNITY" as const,
      title: "Tu historia cultural está registrada",
      body: "Puedes editarla y completarla cuando tengas nuevas fotografías."
    },
    {
      type: "ORDER" as const,
      title: "Tienes un pedido reciente",
      body: "Revisa el resumen del pedido vinculado a tu pieza cultural."
    }
  ]) {
    await prisma.notification.create({
      data: { userId: artisan.id, ...notification }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
