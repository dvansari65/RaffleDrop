const stats = [
    { value: "$2.4M+", label: "Total Volume", description: "In raffle transactions" },
    { value: "12,847", label: "Raffles Completed", description: "Successfully executed" },
    { value: "8,523", label: "Active Users", description: "And growing daily" },
    { value: "99.9%", label: "Uptime", description: "Reliable infrastructure" },
  ];
  
  const StatsSection = () => {
    return (
      <section id="stats" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="glass rounded-3xl border border-primary/20 p-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl hover:bg-primary/5 transition-colors"
                >
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default StatsSection;
  