# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    # Core development tools
    pkgs.git
    pkgs.curl
    pkgs.jq
    
    # Python environment for backend
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.virtualenv
    pkgs.python311Packages.pyyaml
    pkgs.python311Packages.python-dotenv
    pkgs.python311Packages.openai
    pkgs.python311Packages.streamlit
    pkgs.python311Packages.pandas
    pkgs.python311Packages.numpy
    pkgs.python311Packages.requests
    
    # Node.js for Next.js frontend
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.yarn
    pkgs.nodePackages.pnpm
    
    # Useful development utilities
    pkgs.ripgrep  # Better grep
    pkgs.fd       # Better find
    pkgs.htop     # Process viewer
    pkgs.wget     # For downloading files
    pkgs.gnused   # For text processing
    
    # Web search tools
    pkgs.w3m      # Text-based web browser
    pkgs.lynx     # Another text-based web browser
  ];

  # Sets environment variables in the workspace
  env = {
    # Placeholder for OpenAI API key - replace with your actual key or use .env files
    # OPENAI_API_KEY = "your-api-key";
    
    # Python settings
    PYTHONPATH = "/home/user/cre-deal-finder";
    
    # Node.js settings
    NODE_ENV = "development";
    
    # Search settings
    BROWSER = "w3m";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # Python extensions
      "ms-python.python"
      "ms-python.vscode-pylance"
      
      # JavaScript/TypeScript extensions
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "bradlc.vscode-tailwindcss"
      
      # General development extensions
      "eamodio.gitlens"
      "github.copilot"
      "github.vscode-pull-request-github"
      "ms-vsliveshare.vsliveshare"
      "streetsidesoftware.code-spell-checker"
      "yzhang.markdown-all-in-one"
      
      # YAML support for configuration files
      "redhat.vscode-yaml"
      
      # Additional useful extensions
      "ms-azuretools.vscode-docker"
      "ritwickdey.liveserver"
      "christian-kohler.path-intellisense"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        # Next.js frontend preview
        web = {
          command = [
            "npm"
            "run"
            "dev"
            "--"
            "--port"
            "$PORT"
            "--host"
            "0.0.0.0"
          ];
          cwd = "next-app";
          manager = "web";
          env = {
            PORT = "$PORT";
            NEXT_TELEMETRY_DISABLED = "1";
          };
        };
        
        # Streamlit app preview
        streamlit-web = {
          command = [
            "streamlit"
            "run"
            "app.py"
            "--server.port"
            "$PORT"
            "--server.address"
            "0.0.0.0"
          ];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
        
        # Python API preview
        api = {
          command = [
            "python"
            "main.py"
          ];
          manager = "web";
          env = {
            PORT = "$PORT";
            PYTHONUNBUFFERED = "1";
          };
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Install Python dependencies
        install-python-deps = "pip install -r requirements.txt";
        
        # Install Next.js dependencies
        install-next-deps = "cd next-app && npm install";
        
        # Create necessary directories
        create-dirs = "mkdir -p logs output";
        
        # Setup Python virtual environment (alternative to system packages)
        setup-venv = "python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt";
      };
      
      # Runs when the workspace is (re)started
      onStart = {
        # Check Python and Node.js versions
        check-versions = "echo 'Python:' && python --version && echo 'Node:' && node --version && echo 'NPM:' && npm --version";
        
        # Activate virtual environment if it exists
        activate-venv = "if [ -d '.venv' ]; then source .venv/bin/activate; fi";
        
        # Check for updates to dependencies
        check-updates = "echo 'Checking for updates...' && cd next-app && npm outdated || true";
      };
    };
  };
  
  # Enable services
  services = {
    # Enable PostgreSQL if needed
    # postgres = {
    #   enable = true;
    #   listen_addresses = "127.0.0.1";
    #   port = 5432;
    # };
    
    # Enable Redis if needed
    # redis = {
    #   enable = true;
    #   port = 6379;
    # };
  };
}
